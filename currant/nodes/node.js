
class CurrantNodeParseError extends Error {
    constructor() {
        super("Unable to parse node");
    }
}

class CurrantNode {

    static get EVAL_NODES() {
        return [
            CurrantVariableGetNode,
            CurrantPointerDerefNode,
            CurrantFunctionCallNode,
            CurrantArrayAccessNode,
            CurrantU8Node, CurrantU16Node, CurrantU32Node, CurrantU64Node,
            CurrantI8Node, CurrantI16Node, CurrantI32Node, CurrantI64Node,
            CurrantF32Node, CurrantF64Node,
            CurrantBooleanNode,
            CurrantStringNode,
            CurrantMemberAccessNode,
            CurrantJsReferenceNode,
            CurrantMemberPointerNode,
            CurrantPointerNode,
            CurrantFunctionNode,
            CurrantArrayNode,
            CurrantGetType,
            CurrantCastNumberNode,
            CurrantParenthesesNode,
            CurrantNegateBooleanNode,
            CurrantMultiplicativeNode,
            CurrantAdditiveNode,
            CurrantRelationalNode,
            CurrantEqualityNode,
            CurrantLogicalAndNode,
            CurrantLogicalOrNode,
            CurrantVariableSetNode,
            CurrantVariableCreateNode,
            CurrantReturnNode
        ].reverse();
    }

    static get SCOPE_OPERATORS() {
        return [
            ["{", "}"],
            ["(", ")"],
            ["[", "]"]
        ];
    }

    constructor(name) {
        this.name = name;
        this.block = null;
        this.invalidOnScopeMismatch = false;
        if(typeof this.doParse !== "function") throw new Error(`"${this.constructor.name}" does not implement 'doParse()'`);
        if(typeof this.doExecute !== "function") throw new Error(`"${this.constructor.name}" does not implement 'doExecute()'`);
    }

    copy(block) {
        let instance = new this.constructor();
        for(const objectKey of Object.keys(this)) {
            instance[objectKey] = this[objectKey];
        }
        instance.block = block;
        instance.children = [];
        let childBlock = block;
        if(instance instanceof CurrantBlockNode) childBlock = instance;
        for(let childIndex = 0; childIndex < this.children.length; childIndex++) {
            if(this.children[childIndex] === null) instance.addChild(null);
            else instance.addChild(this.children[childIndex].copy(childBlock));
        }
        if(typeof instance.afterCopy === "function") instance.afterCopy();
        return instance;
    }

    disableScopeMismatchErrors(disable) {
        this.invalidOnScopeMismatch = disable === true;
        return this;
    }

    parse(tokens) {
        this.tokens = tokens;
        this.tokenIndex = 0;
        this.children = [];
        this.line = null;
        this.file = null;
        if(this.tokens.length > 0) {
            this.line = this.tokens[0].line;
            this.file = this.tokens[0].file;
            this.tokens[0].currant.currentLine = this.line;
            this.tokens[0].currant.currentFile = this.file;
        }
        this.doParse();
        this.src = "";
        for(const token of this.tokens) this.src += token.text;
        delete this.tokens;
        delete this.tokenIndex;
        return this;
    }

    parseInvalid() {
        throw new CurrantNodeParseError();
    }

    checkTokenInBounds() {
        if(this.tokenIndex < 0 || this.tokenIndex >= this.tokens.length)
            this.parseInvalid();
    }

    token() {
        this.checkTokenInBounds();
        return this.tokens[this.tokenIndex];
    }

    expectToken(tokenName) {
        this.checkTokenInBounds();
        if(this.token().name !== tokenName)
            this.parseInvalid();
    }

    nextToken() {
        this.checkTokenInBounds();
        this.tokenIndex++;
        this.checkTokenInBounds();
    }

    hasNextToken() {
        return this.tokenIndex + 1 < this.tokens.length;
    }

    evalUntilLast(tokenList, invalidOnScopeMismatch) {
        if(this.tokens.length === 0) this.parseInvalid();
        let startIndex = this.tokenIndex;
        let scopes = new Array(CurrantNode.SCOPE_OPERATORS.length).fill(0);
        let lastIndex = -1;
        try {
            for(let tokenIndex = startIndex; tokenIndex < this.tokens.length; tokenIndex++) {
                let atBaseScopes = this._getAtBaseScopes(scopes);
                if(tokenList.includes(this.tokens[tokenIndex].name) && atBaseScopes) lastIndex = tokenIndex;
                for(let scopeIndex = 0; scopeIndex < CurrantNode.SCOPE_OPERATORS.length; scopeIndex++) {
                    const scopeOperators = CurrantNode.SCOPE_OPERATORS[scopeIndex];
                    if(this.tokens[tokenIndex].text === scopeOperators[0]) scopes[scopeIndex]++;
                    if(this.tokens[tokenIndex].text === scopeOperators[1]) scopes[scopeIndex]--;
                }
            }
        } catch(error) {
            if(!(error instanceof CurrantNodeParseError)) throw error;
            for(let scopeIndex = 0; scopeIndex < CurrantNode.SCOPE_OPERATORS.length; scopeIndex++) {
                const scopeOperators = CurrantNode.SCOPE_OPERATORS[scopeIndex];
                const scopeValue = scopes[scopeIndex];
                if(scopeValue === 0) continue;
                if(scopeValue > 0 && invalidOnScopeMismatch === false && this.invalidOnScopeMismatch === false) throw new Error(`Opened scope using "${scopeOperators[0]}", but never closed it using "${scopeOperators[1]}"`);
                if(scopeValue < 0 && invalidOnScopeMismatch === false && this.invalidOnScopeMismatch === false) throw new Error(`Closed scope using "${scopeOperators[1]}", but never opened it using "${scopeOperators[0]}"`);
                if(invalidOnScopeMismatch === true || this.invalidOnScopeMismatch === true) this.parseInvalid();
            }
            throw error;
        }
        if(lastIndex === -1) this.parseInvalid();
        this.tokenIndex = lastIndex;
        return this.evalTokens(this.tokens.slice(startIndex, lastIndex), false, true);
    }

    evalUntilLastScopeOpen(scopeOpen, scopeClose) {
        let startIndex = this.tokenIndex;
        let scope = 0;
        let lastIndex = -1;
        for(let tokenIndex = startIndex; tokenIndex < this.tokens.length; tokenIndex++) {
            if(this.tokens[tokenIndex].name === scopeOpen && scope === 0) lastIndex = tokenIndex;
            if(this.tokens[tokenIndex].name === scopeOpen) scope++;
            if(this.tokens[tokenIndex].name === scopeClose) scope--;
        }
        if(lastIndex === -1) this.parseInvalid();
        this.tokenIndex = lastIndex;
        return this.evalTokens(this.tokens.slice(startIndex, lastIndex), false, true);
    }

    // evaluates until any token in the list is reached.
    // should the current token be one of the ones in the list, it is ignored and evaluated as well.
    // should the list be null, it is evaluated until the end of the token list.
    evalUntil(tokenList, errorIfFailed, invalidOnScopeMismatch) {
        let endsAtListEnd = (tokenList === null || typeof tokenList === "undefined");
        if(endsAtListEnd) {
            tokenList = ["line_terminator"];
        }
        let scopes = new Array(CurrantNode.SCOPE_OPERATORS.length).fill(0);
        let collectedTokens = [];
        if(this.tokens.length === 0) this.parseInvalid();
        try {
            while(true) {
                let atBaseScopes = this._getAtBaseScopes(scopes);
                if(atBaseScopes && collectedTokens.length > 0 && tokenList.includes(this.token().name))
                    break;
                for(let scopeIndex = 0; scopeIndex < CurrantNode.SCOPE_OPERATORS.length; scopeIndex++) {
                    const scopeOperators = CurrantNode.SCOPE_OPERATORS[scopeIndex];
                    if(this.token().text === scopeOperators[0]) scopes[scopeIndex]++;
                    if(this.token().text === scopeOperators[1]) scopes[scopeIndex]--;
                }
                atBaseScopes = this._getAtBaseScopes(scopes);
                collectedTokens.push(this.token());
                if(atBaseScopes && collectedTokens.length > 0 && endsAtListEnd && !this.hasNextToken())
                    break;
                this.nextToken();
            }
        } catch(error) {
            if(!(error instanceof CurrantNodeParseError)) throw error;
            for(let scopeIndex = 0; scopeIndex < CurrantNode.SCOPE_OPERATORS.length; scopeIndex++) {
                const scopeOperators = CurrantNode.SCOPE_OPERATORS[scopeIndex];
                const scopeValue = scopes[scopeIndex];
                if(scopeValue === 0) continue;
                if(scopeValue > 0 && invalidOnScopeMismatch === false && this.invalidOnScopeMismatch === false) throw new Error(`Opened scope using "${scopeOperators[0]}", but never closed it using "${scopeOperators[1]}"`);
                if(scopeValue < 0 && invalidOnScopeMismatch === false && this.invalidOnScopeMismatch === false) throw new Error(`Closed scope using "${scopeOperators[1]}", but never opened it using "${scopeOperators[0]}"`);
                if(invalidOnScopeMismatch === true || this.invalidOnScopeMismatch === true) this.parseInvalid();
            }
            throw error;
        }
        return this.evalTokens(collectedTokens, errorIfFailed, false);
    }

    evalTokens(tokenList, errorIfFailed, disableScopeMismatchErrors) {
        for(const evalNodeType of CurrantNode.EVAL_NODES) {
            try {
                return new evalNodeType()
                    .disableScopeMismatchErrors(disableScopeMismatchErrors === true)
                    .parse(tokenList);
            } catch(error) {
                if(!((error instanceof CurrantNodeParseError))) throw error;
            }
        }
        if(errorIfFailed === true) throw new Error("Syntax Error");
        this.parseInvalid();
    }

    _getAtBaseScopes(scopes) {
        for(const scope of scopes) {
            if(scope <= 0) continue;
            return false;
        }
        return true;
    }

    expectEnd() {
        if(this.hasNextToken())
            this.parseInvalid();
    }

    addChild(childNode) {
        this.children.push(childNode);
        if(childNode === null) return;
        let childBlock = this.block;
        if(this instanceof CurrantBlockNode) childBlock = this;
        childNode.setBlock(childBlock);
    }

    setBlock(blockNode) {
        this.block = blockNode;
        if(this instanceof CurrantBlockNode) {
            if(blockNode !== null) this.setRuntime(blockNode.currant);
            return;
        }
        for(const child of this.children) {
            if(child === null) continue;
            child.setBlock(blockNode);
        }
    }

    childValue(index) {
        if(this.childValues[index] === null) return null;
        if(this.childValues[index] instanceof CurrantVariableReference)
            return this.childValues[index].get();
        return this.childValues[index];
    }

    execute() {
        this.block.currant.currentLine = this.line;
        this.block.currant.currentFile = this.file;
        this.executeChildren = true;
        if(typeof this.prepareExecute === "function") this.prepareExecute();
        this.childValues = new Array(this.children.length);
        for(let childIndex = 0; childIndex < this.children.length; childIndex++) {
            if(!this.executeChildren) break;
            if(this.children[childIndex] === null) this.childValues[childIndex] = null;
            else this.childValues[childIndex] = this.children[childIndex].execute();
        }
        return this.doExecute();
    }

}