
// "currant/parsing/preprocessor.js"

// define the currant preprocessor
// removes comments, replaces definitions
class CurrantPreprocessor {

    constructor() {
        this.macros = [];
    }

    createMacroObject(regex, replacement) {
        return {
            regex,
            replacement
        };
    }

    process(scriptText) {
        // read macros written in the script
        let macroStart = "#start-macro";
        let macroEnd = "#end-macro";
        let scriptLines = scriptText.split("\n");
        let currentMacroRegex = null;
        let currentMacroReplacement = "";
        for(const scriptLineRaw of scriptLines) {
            let scriptLine = scriptLineRaw.trim();
            if(currentMacroRegex === null) {
                if(scriptLine.startsWith(macroStart))
                    currentMacroRegex = new RegExp(scriptLine.substring(macroStart.length + 1), "gm")
                continue;
            }
            if(scriptLine.startsWith(macroEnd)) {
                this.macros.push(this.createMacroObject(currentMacroRegex, currentMacroReplacement.substring(0, currentMacroReplacement.length - 1)));
                currentMacroRegex = null;
                currentMacroReplacement = "";
                continue;
            }
            currentMacroReplacement += scriptLineRaw + "\n";
        }
        // remove macro definitions and line comments
        let result = "";
        let inMacro = false;
        for(const scriptLineRaw of scriptLines) {
            let scriptLine = scriptLineRaw.trim();
            if(scriptLine.startsWith(macroStart))
                inMacro = true;
            if(inMacro)
                result += "\n";
            if(!inMacro)
                result += scriptLineRaw + "\n";
            if(scriptLine.startsWith(macroEnd))
                inMacro = false;
        }
        result = result
                .split(/\/\/.*$/gm) // line comments
                .join("");
        // replace block comments, but do not remove line separators
        let blockCommentRegex = /\/\*((?!\*\/).)*\*\//ms;
        while(true) {
            let blockCommentMatch = blockCommentRegex.exec(result);
            if(blockCommentMatch == null) break;
            let textBeforeMatch = result.substring(0, blockCommentMatch.index);
            let textAfterMatch = result.substring(blockCommentMatch.index + blockCommentMatch[0].length);
            let matchReplacement = "";
            for(let i = 0; i < (blockCommentMatch[0].match(/\n/g) || []).length; i++) {
                matchReplacement += "\n";
            }
            result = textBeforeMatch + matchReplacement + textAfterMatch;
        }
        // replace definitions
        for(const macro of this.macros) {
            // get matches and their groups
            while(true) {
                let match = macro.regex.exec(result);
                if(match === null) break;
                let replacement = macro.replacement.slice(0, macro.replacement.length);
                let matchRefRegex = new RegExp("{\\d+}");
                while(true) {
                    let matchRefMatch = matchRefRegex.exec(replacement);
                    if(matchRefMatch === null) break;
                    replacement = replacement.slice(0, matchRefMatch.index)
                        + match[Number(matchRefMatch[0].slice(1, 2)) + 1]
                        + replacement.slice(matchRefMatch.index + matchRefMatch[0].length, replacement.length);
                }
                result = result.slice(0, match.index)
                    + replacement
                    + result.slice(match.index + match[0].length, result.length);
            }
        }
        return result;
    }

}




// "currant/parsing/lexer.js"

// define the currant lexer
class CurrantLexer {

    constructor() {
        // define the token presets
        this.presets = [
            this.createPreset("\\d+u8", "u8_literal"),
            this.createPreset("\\d+u16", "u16_literal"),
            this.createPreset("\\d+u32", "u32_literal"),
            this.createPreset("\\d+u64", "u64_literal"),
            this.createPreset("-?\\d+i8", "i8_literal"),
            this.createPreset("-?\\d+i16", "i16_literal"),
            this.createPreset("-?\\d+i32", "i32_literal"),
            this.createPreset("-?\\d+i64", "i64_literal"),
            this.createPreset("-?\\d+(\\.\\d+)?f32", "f32_literal"),
            this.createPreset("-?\\d+(\\.\\d+)?f64", "f64_literal"),
            this.createPreset("true", "boolean_literal"),
            this.createPreset("false", "boolean_literal"),
            this.createPreset("\\\".*?\\\"", "string_literal"),

            this.createPreset("\\/\\/", "line_comment"),
            this.createPreset("\\/\\*", "block_comment_start"),
            this.createPreset("\\*\\/", "block_comment_end"),
            this.createPreset(";", "line_terminator"),

            this.createPreset("\\(", "opening_parenthesis"),
            this.createPreset("\\)", "closing_parenthesis"),
            this.createPreset("\\[", "opening_bracket"),
            this.createPreset("\\]", "closing_bracket"),
            this.createPreset("{", "opening_brace"),
            this.createPreset("}", "closing_brace"),

            this.createPreset("=", "equals"),
            this.createPreset("\\+", "plus"),
            this.createPreset("-", "minus"),
            this.createPreset("\\*", "asterisk"),
            this.createPreset("\\/", "slash"),
            this.createPreset("%", "percent"),
            this.createPreset("&", "ampersand"),
            this.createPreset("!", "exclamation_mark"),
            this.createPreset("\\.", "dot"),
            this.createPreset("<", "smaller"),
            this.createPreset(">", "greater"),
            this.createPreset(",", "comma"),
            this.createPreset(":", "colon"),
            this.createPreset("@", "at"),
            this.createPreset("#", "hashtag"),
            this.createPreset("~", "tilde"),
            this.createPreset("\\?", "question_mark"),
            this.createPreset("\\$", "dollar"),

            this.createPreset("&&", "double_ampersand"),
            this.createPreset("\\|\\|", "double_pipe"),
            this.createPreset("==", "double_equals"),
            this.createPreset("!=", "not_equals"),
            this.createPreset("<=", "smaller_equals"),
            this.createPreset(">=", "greater_equals"),
            this.createPreset("<-", "arrow_left"),
            this.createPreset("->", "arrow_right"),

            this.createPreset("[\\w\\d_]+", "identifier")
        ];
    }

    createPreset(regex, name) {
        return {
            name,
            pattern: new RegExp(regex, "g")
        };
    }

    tokenize(scriptText, fileName) {
        let tokens = [];
        // detect *any* matching tokens
        for(const tokenPreset of this.presets) {
            let match;
            while((match = tokenPreset.pattern.exec(scriptText)) != null) {
                let token = {
                    index: match.index,
                    length: match[0].length,
                    name: tokenPreset.name,
                    text: match[0],
                    file: fileName
                };
                tokens.push(token);
            }
        }
        // sort the tokens
        tokens.sort((a, b) => a.index - b.index);
        // find overlaps between tokens
        let tokenPositions = [];
        let tokensActive = new Array(tokens.length);
        for(let i = 0; i < tokensActive.length; i++) tokensActive[i] = false;
        let overlaps = [];
        for(const token of tokens) {
            tokenPositions.push({
                index: token.index,
                active: true,
                token
            });
            tokenPositions.push({
                index: token.index + token.text.length,
                active: false,
                token
            });
        }
        tokenPositions.sort((a, b) => a.index - b.index);
        for(const tokenPosition of tokenPositions) {
            if(tokenPosition.active) {
                for(let tokenIndex = 0; tokenIndex < tokensActive.length; tokenIndex++) {
                    if(!tokensActive[tokenIndex]) continue;
                    overlaps.push([
                        tokenPosition.token,
                        tokens[tokenIndex]
                    ]);
                }
            }
            tokensActive[tokens.indexOf(tokenPosition.token)] = tokenPosition.active;
        }
        // between all overlaps, remove the ones that are smaller.
        // If they are of same size, remove the identifier.
        let removedTokens = [];
        for(const overlap of overlaps) {
            let removed = 0;
            if(removedTokens.includes(overlap[0])) continue;
            if(removedTokens.includes(overlap[1])) continue;
            if(overlap[0].length > overlap[1].length) removed = 1;
            else if(overlap[0].length < overlap[1].length) removed = 0;
            else if(overlap[0].name === "identifier") removed = 0;
            else if(overlap[1].name === "identifier") removed = 1;
            removedTokens.push(overlap[removed]);
        }
        for(const removedToken of removedTokens) {
            tokens.splice(tokens.indexOf(removedToken), 1);
        }
        // calculate the line of each token they are on, and remove index and length
        for(const token of tokens) {
            token.line = (scriptText.substring(0, token.index).match(/\n/g) || []).length + 1;
            delete token.index;
            delete token.length;
        }
        // return tokens
        return tokens;
    }

}




// "currant/types/typeUtils.js"

function currantCompareTypes(a, b) {
    if(a instanceof CurrantCustomType && b instanceof CurrantCustomType)
        return a === b;
    return a.constructor === b.constructor;
}

function currantCreateDoNumCheck(value) {
    if(typeof value !== "number" && typeof value !== "bigint")
        throw new Error("tried to create Currant number type instance from something that is not a number");
}

function currantCreateU8(value) {
    currantCreateDoNumCheck(value);
    return new CurrantU8Type().fromValue(Number(value));
}
function currantCreateU16(value) {
    currantCreateDoNumCheck(value);
    return new CurrantU16Type().fromValue(Number(value));
}
function currantCreateU32(value) {
    currantCreateDoNumCheck(value);
    return new CurrantU32Type().fromValue(Number(value));
}
function currantCreateU64(value) {
    currantCreateDoNumCheck(value);
    return new CurrantU64Type().fromValue(BigInt(Number(value)));
}

function currantCreateI8(value) {
    currantCreateDoNumCheck(value);
    return new CurrantI8Type().fromValue(Number(value));
}
function currantCreateI16(value) {
    currantCreateDoNumCheck(value);
    return new CurrantI16Type().fromValue(Number(value));
}
function currantCreateI32(value) {
    currantCreateDoNumCheck(value);
    return new CurrantI32Type().fromValue(Number(value));
}
function currantCreateI64(value) {
    currantCreateDoNumCheck(value);
    return new CurrantI64Type().fromValue(BigInt(Number(value)));
}

function currantCreateF32(value) {
    currantCreateDoNumCheck(value);
    return new CurrantF32Type().fromValue(Number(value));
}
function currantCreateF64(value) {
    currantCreateDoNumCheck(value);
    return new CurrantF64Type().fromValue(Number(value));
}

function currantCreateBool(value) {
    if(typeof value !== "boolean")
        throw new Error("tried to create Currant boolean type instance from something that is not a boolean");
    return new CurrantBooleanType().fromValue(value);
}

function currantCreateFun(value) {
    if(typeof value !== "function")
        throw new Error("tried to create Currant function type instance from something that is not a function");
    return new CurrantFunctionType().fromValue(new CurrantJsFunction(value));
}

function currantCreateArray(value) {
    if(value.constructor !== Array)
        throw new Error("tried to create Currant array type instance from something that is not an array");
    return new CurrantArrayType().fromValue(new CurrantArray(value));
}

function currantCreateStr(value) {
    if(typeof value !== "string")
        throw new Error("tried to create Currant str type instance from something that is not a string");
    return new CurrantStringType().fromValue(value);
}



// "currant/nodes/node.js"

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
        if(this.childValues[index] === null) return;
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
            this.childValues[childIndex] = this.children[childIndex].execute();
        }
        return this.doExecute();
    }

}



// "currant/nodes/blockNode.js"

class CurrantBlockNode extends CurrantNode {

    constructor() {
        super("block");
        this.returnable = true;
        this.currant = null;
    }

    afterCopy() {
        this.variables = new Map(this.variables);
    }

    setRuntime(interpreter) {
        this.currant = interpreter;
        return this;
    }

    afterBlock() {
        if(this.block === null) return;
        this.setRuntime(this.block.currant);
    }

    setReturnable(returnable) {
        this.returnable = returnable;
        return this;
    }

    doParse() {
        if(this.tokens.length === 0) return;
        while(true) {
            if(super.token().name === "line_terminator") {
                if(!super.hasNextToken()) break;
                super.nextToken();
                continue;
            }
            super.addChild(super.evalUntil(null, true, false));
            if(!super.hasNextToken()) break;
            super.expectToken("line_terminator");
            super.nextToken();
        }
        super.expectEnd();
    }

    returnValue(value) {
        if(!this.returnable) {
            this.returnedValue = null;
            this.block.returnValue(value);
        } else {
            this.returnedValue = value;
        }
        this.executeChildren = false;
    }

    setAfterPrepare(action) {
        this.afterPrepare = action;
    }

    execute() {
        this.executeChildren = true;
        this.prepareExecute();
        this.childValues = new Array(this.children.length);
        for(let childIndex = 0; childIndex < this.children.length; childIndex++) {
            if(!this.executeChildren) break;
            this.childValues[childIndex] = this.children[childIndex].execute();
        }
        return this.doExecute();
    }

    prepareExecute() {
        this.returnedValue = null;
        this.variables = new Map();
        if(typeof this.afterPrepare !== "undefined") this.afterPrepare();
        this.afterPrepare = undefined;
    }

    doExecute() {
        if(this.returnedValue === null) return new CurrantNothingType().fromNode(null);
        return this.returnedValue;
    }

    static staticHasVariable(variables, parentBlock, name) {
        let parentHas = false;
        if(parentBlock !== null)
            parentHas = CurrantBlockNode.staticHasVariable(parentBlock.variables, parentBlock.block, name);
        return variables.has(name) || parentHas;
    }

    hasVariable(name) {
        return CurrantBlockNode.staticHasVariable(this.variables, this.block, name);
    }

    static staticGetVariable(variables, parentBlock, name) {
        if(!variables.has(name) && parentBlock !== null)
            return CurrantBlockNode.staticGetVariable(parentBlock.variables, parentBlock.block, name);
        if(!variables.has(name))
            throw new Error(`"${name}" is not a variable known by this scope`);
        return variables.get(name).get();
    }

    getVariable(name) {
        return CurrantBlockNode.staticGetVariable(this.variables, this.block, name);
    }

    static staticGetVariableRef(variables, parentBlock, name) {
        return new CurrantVariableReference((value) => {
            CurrantBlockNode.staticSetVariable(variables, parentBlock, name, value);
        }, () => {
            return CurrantBlockNode.staticGetVariable(variables, parentBlock, name);
        });
    }

    getVariableRef(name) {
        return CurrantBlockNode.staticGetVariableRef(this.variables, this.block, name);
    }

    static staticSetVariable(variables, parentBlock, name, value) {
        if(!CurrantBlockNode.staticHasVariable(variables, parentBlock, name) || variables.has(name)) { // does not exist in upper scope
            variables.set(name, new CurrantBlockVariableWrapperObject(value));
            return;
        }
        CurrantBlockNode.staticSetVariable(parentBlock.variables, parentBlock.block, name, value);
    }

    setVariable(name, value) {
        CurrantBlockNode.staticSetVariable(this.variables, this.block, name, value);
    }

    static staticCreateVariable(variables, parentBlock, name, value) {
        variables.set(name, new CurrantBlockVariableWrapperObject(value));
    }

    createVariable(name, value) {
        CurrantBlockNode.staticCreateVariable(this.variables, this.block, name, value);
    }

}

class CurrantBlockVariableWrapperObject {

    constructor(value) {
        this.value = value;
    }

    get() {
        return this.value;
    }

}



// "currant/nodes/literalNode.js"

class CurrantLiteralNode extends CurrantNode {

    constructor(name, literalTokenName, literalType) {
        super(name);
        this.tokenName = literalTokenName;
        this.literalType = literalType;
    }

    doParse() {
        super.expectToken(this.tokenName);
        this.value = super.token().text;
        super.expectEnd();
    }

    doExecute() {
        return new this.literalType().fromNode(this);
    }

}



// "currant/nodes/variableNodes.js"

class CurrantVariableCreateNode extends CurrantNode {

    constructor() { super("variable-create"); }

    doParse() { // <name>: <type> = <value>
        super.expectToken("identifier");
        this.varName = super.token().text;
        super.nextToken();
        super.expectToken("colon");
        super.nextToken();
        super.addChild(super.evalUntil(["equals"], false, false));
        super.expectToken("equals");
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        if(!(this.childValue(0).get() instanceof CurrantType))
            throw new Error(`unable to create variable - "${this.children[0].src}" is not a type`);
        if(!currantCompareTypes(this.childValue(0).get(), this.childValue(1).type))
            throw new Error(`unable to create variable - "${this.children[1].src}" is not of type "${this.children[0].src}"`);
        this.block.createVariable(this.varName, this.childValue(1).copy());
        return this.block.getVariableRef(this.varName);
    }

}

class CurrantVariableSetNode extends CurrantNode {

    constructor() { super("variable-set"); }

    doParse() {
        super.addChild(super.evalUntil(["equals"], false, false));
        super.expectToken("equals");
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        if(!(this.childValues[0] instanceof CurrantVariableReference))
            throw new Error(`unable to set variable - "${this.children[0].src}" is not a variable`);
        if(!currantCompareTypes(this.childValue(0).type, this.childValue(1).type))
            throw new Error(`unable to set variable - "${this.children[1].src}" does not have the correct type for "${this.children[0].src}"`);
        this.childValues[0].set(this.childValue(1).copy());
        return this.childValues[0];
    }

}

class CurrantVariableGetNode extends CurrantLiteralNode {

    constructor() { super("variable-get", "identifier"); }

    doExecute() {
        return this.block.getVariableRef(this.value);
    }

}



// "currant/nodes/jsReference.js"

class CurrantJsReferenceNode extends CurrantNode {

    constructor() { super("js-reference"); }

    doParse() {
        super.expectToken("identifier");
        if(super.token().text !== "t" && super.token().text !== "f") super.parseInvalid();
        this.refType = super.token().text;
        super.nextToken();
        super.expectToken("at");
        super.nextToken();
        super.expectToken("identifier");
        this.refName = super.token().text;
        super.expectEnd();
    }

    doExecute() {
        switch(this.refType) {
            case "t": return this._executeClassRef();
            case "f": return this._executeFunctionRef();
        }
    }

    _executeClassRef() {
        try {
            let typeInstance = eval(`new ${this.refName}()`);
            if(!(typeInstance instanceof CurrantType))
                throw new ReferenceError();
            return new CurrantTypeType().fromValue(typeInstance);
        } catch(e) {
            if(!(e instanceof ReferenceError)) throw e;
            throw new Error(`"t@${this.refName}" does not refer to a known Javascript class that extends 'CurrantType'.`);
        }
    }

    _executeFunctionRef() {
        try {
            let functionReference = eval(`${this.refName}`);
            if(typeof functionReference !== "function")
                throw new ReferenceError();
            return currantCreateFun(functionReference);
        } catch(e) {
            if(!(e instanceof ReferenceError)) throw e;
            throw new Error(`"f@${this.refName}" does not refer to a known Javascript function.`);
        }
    }

}



// "currant/nodes/booleanLogic.js"

class CurrantNegateBooleanNode extends CurrantNode {

    constructor() { super("negate-bool"); }

    doParse() {
        super.expectToken("exclamation_mark");
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        let value = super.childValue(0);
        if(typeof value.get() !== "boolean")
            throw new Error(`failed to negate value - "${this.children[0].src}" is not a boolean`);
        value.value[0] = !value.value[0];
        return value;
    }

}

class CurrantLogicalAndNode extends CurrantNode {

    constructor() { super("logical-and"); }

    doParse() {
        super.addChild(super.evalUntil(["double_ampersand"], false, false));
        super.expectToken("double_ampersand");
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        let operand1 = super.childValue(0).get();
        if(typeof operand1 !== "boolean")
            throw new Error(`failed to compute logical AND - "${this.children[0].src}" is not a boolean`);
        let operand2 = super.childValue(1).get();
        if(typeof operand2 !== "boolean")
            throw new Error(`failed to compute logical AND - "${this.children[1].src}" is not a boolean`);
        return super.childValue(0).type.fromValue(operand1 && operand2)
    }

}

class CurrantLogicalOrNode extends CurrantNode {

    constructor() { super("logical-or"); }

    doParse() {
        super.addChild(super.evalUntil(["double_pipe"], false, false));
        super.expectToken("double_pipe");
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        let operand1 = super.childValue(0).get();
        if(typeof operand1 !== "boolean")
            throw new Error(`failed to compute logical OR - "${this.children[0].src}" is not a boolean`);
        let operand2 = super.childValue(1).get();
        if(typeof operand2 !== "boolean")
            throw new Error(`failed to compute logical OR - "${this.children[1].src}" is not a boolean`);
        return super.childValue(0).type.fromValue(operand1 || operand2);
    }

}



// "currant/nodes/numberOperations.js"

function currantGetNumberTypes() {
    return [
        CurrantI8Type, CurrantI16Type, CurrantI32Type, CurrantI64Type,
        CurrantU8Type, CurrantU16Type, CurrantU32Type, CurrantU64Type,
        CurrantF32Type, CurrantF64Type
    ];
}

class CurrantCastNumberNode extends CurrantNode {

    constructor() { super("cast-number"); }

    doParse() {
        super.addChild(super.evalUntil(["tilde"], false, false));
        super.expectToken("tilde");
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        let convertType = super.childValue(0).get();
        let number = super.childValue(1).get();
        let numberType = super.childValue(1).type;
        if(!currantGetNumberTypes().includes(numberType.constructor))
            throw new Error(`failed to cast between number types - "${this.children[1].src}" is not a number`);
        if(!currantGetNumberTypes().includes(convertType.constructor))
            throw new Error(`failed to cast between number types - "${this.children[0].src}" is not a number type`);
        let numberTypeIsBigInt = numberType.constructor === CurrantI64Type || numberType.constructor === CurrantU64Type;
        let convertTypeIsBigInt = convertType.constructor === CurrantI64Type || convertType.constructor === CurrantU64Type;
        if(numberTypeIsBigInt && !convertTypeIsBigInt)
            number = Number(number);
        if(!numberTypeIsBigInt && convertTypeIsBigInt)
            number = BigInt(number);
        return convertType.fromValue(number);
    }

}

class CurrantAdditiveNode extends CurrantNode {

    constructor() { super("additive"); }

    doParse() {
        super.addChild(super.evalUntilLast(["plus", "minus"], true));
        this.operation = super.token().text;
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        if(!currantCompareTypes(super.childValue(0).type, super.childValue(1).type))
            throw new Error(`unable to do arithmetic operation (or string concatenation) - "${this.children[0].src}" and "${this.children[1].src}" do not have the same type`);
        if(!currantGetNumberTypes().includes(super.childValue(0).type.constructor) && super.childValue(0).type.constructor !== CurrantStringType)
            throw new Error(`unable to do arithmetic operation (or string concatenation) - "${this.children[0].src}" is not a number or string`);
        if(this.operation !== "+" && super.childValue(0).type.constructor === CurrantStringType)
            throw new Error(`unable to do arithmetic operation - "${this.children[0].src}" is not a number`);
        let resultStorage = super.childValue(0).type.varStorage(1);
        switch(this.operation) {
            case "+": resultStorage[0] = super.childValue(0).get() + super.childValue(1).get(); break;
            case "-": resultStorage[0] = super.childValue(0).get() - super.childValue(1).get(); break;
        }
        return new CurrantTypeInstance(super.childValue(0).type, resultStorage);
    }

}

class CurrantMultiplicativeNode extends CurrantNode {

    constructor() { super("multiplicative"); }

    doParse() {
        super.addChild(super.evalUntilLast(["asterisk", "slash", "percent"], true));
        this.operation = super.token().text;
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        if(!currantCompareTypes(super.childValue(0).type, super.childValue(1).type))
            throw new Error(`unable to do arithmetic operation - "${this.children[0].src}" and "${this.children[1].src}" do not have the same type`);
        if(!currantGetNumberTypes().includes(super.childValue(0).type.constructor))
            throw new Error(`unable to do arithmetic operation - "${this.children[0].src}" is not a number`);
        let resultStorage = super.childValue(0).type.varStorage(1);
        switch(this.operation) {
            case "*": resultStorage[0] = super.childValue(0).get() * super.childValue(1).get(); break;
            case "/": resultStorage[0] = super.childValue(0).get() / super.childValue(1).get(); break;
            case "%": resultStorage[0] = super.childValue(0).get() % super.childValue(1).get(); break;
        }
        return new CurrantTypeInstance(super.childValue(0).type, resultStorage);
    }

}



// "currant/nodes/comparisons.js"

class CurrantRelationalNode extends CurrantNode {

    constructor() { super("relational"); }

    doParse() {
        super.addChild(super.evalUntil(["smaller", "greater", "smaller_equals", "greater_equals"], false, false));
        this.operation = super.token().text;
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        if(!currantCompareTypes(super.childValue(0).type, super.childValue(1).type))
            throw new Error(`unable to do comparison - "${this.children[0].src}" and "${this.children[1].src}" do not have the same type`);
        if(!currantGetNumberTypes().includes(super.childValue(0).type.constructor))
            throw new Error(`unable to do comparison - "${this.children[0].src}" is not a number`);
        let result = false;
        switch(this.operation) {
            case "<": result = super.childValue(0).get() < super.childValue(1).get(); break;
            case ">": result = super.childValue(0).get() > super.childValue(1).get(); break;
            case "<=": result = super.childValue(0).get() <= super.childValue(1).get(); break;
            case ">=": result = super.childValue(0).get() >= super.childValue(1).get(); break;
        }
        return currantCreateBool(result);
    }

}

class CurrantEqualityNode extends CurrantNode {

    constructor() { super("equality"); }

    doParse() {
        super.addChild(super.evalUntil(["double_equals", "not_equals"], false, false));
        this.operation = super.token().text;
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        let result = false;
        switch(this.operation) {
            case "==": result = super.childValue(0).equals(super.childValue(1)); break;
            case "!=": result = !super.childValue(0).equals(super.childValue(1)); break;
        }
        return new currantCreateBool(result);
    }

}



// "currant/nodes/parentheses.js"

class CurrantParenthesesNode extends CurrantNode {

    constructor() { super("parentheses"); }

    doParse() {
        super.expectToken("opening_parenthesis");
        super.nextToken();
        super.addChild(super.evalUntil(["closing_parenthesis"], false, true));
        super.expectToken("closing_parenthesis");
        super.expectEnd();
    }

    doExecute() {
        return this.childValues[0];
    }

}



// "currant/nodes/getType.js"

class CurrantGetType extends CurrantNode {

    constructor() { super("get-type"); }

    doParse() {
        super.expectToken("hashtag");
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        return new CurrantTypeType().fromValue(this.childValue(0).type);
    }

}



// "currant/types/types.js"

class CurrantInvalidValueError extends Error {
    constructor() { super(`Invalid value for variable`); }
}

class CurrantType {

    constructor() {
        if(typeof this.varStorage !== "function")
            throw new Error(`"${this.constructor.name}" does not implement 'varStorage(size)'`);
        if(typeof this.instNode !== "function")
            throw new Error(`"${this.constructor.name}" does not implement 'instNode(node)'`);
        if(typeof this.instVal !== "function")
            throw new Error(`"${this.constructor.name}" does not implement 'instVal(value)'`);
    }

    fromNode(node) {
        let variableStorage = this.varStorage(1);
        variableStorage[0] = this.instNode(node);
        return new CurrantTypeInstance(this, variableStorage);
    }

    fromValue(value) {
        let variableStorage = this.varStorage(1);
        variableStorage[0] = this.instVal(value);
        return new CurrantTypeInstance(this, variableStorage);
    }

}

class CurrantTypeInstance {

    constructor(type, varStorage) {
        this.type = type;
        this.value = varStorage;
    }

    get() {
        return this.value[0];
    }

    equals(otherInstance) {
        if(!currantCompareTypes(this.type, otherInstance.type)) return false;
        if(typeof this.type.eq !== "function") return this.get() === otherInstance.get();
        return this.type.eq(this.get(), otherInstance.get());
    }

    getValue() {
        if(typeof this.type.val !== "function") return this.get();
        return this.type.val(this.get());
    }

    copy() {
        if(typeof this.type.copy !== "function") return this.type.fromValue(this.value[0]);
        return this.type.fromValue(this.type.copy(this.value[0]));
    }

}



class CurrantVariableReference {

    constructor(setter, getter) {
        this.set = setter;
        this.get = getter;
    }

}



class CurrantTypeType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) { return null; }
    instVal(value) { return value; }
    eq(val1, val2) { return currantCompareTypes(val1, val2); }
}



// "currant/types/unsignedIntegers.js"

class CurrantU8Node extends CurrantLiteralNode {
    constructor() { super("u8-literal", "u8_literal", CurrantU8Type); }
}
class CurrantU8Type extends CurrantType {
    varStorage(size) { return new Uint8Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 2)); }
    instVal(value) { return value; }
}

class CurrantU16Node extends CurrantLiteralNode {
    constructor() { super("u16-literal", "u16_literal", CurrantU16Type); }
}
class CurrantU16Type extends CurrantType {
    varStorage(size) { return new Uint16Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}

class CurrantU32Node extends CurrantLiteralNode {
    constructor() { super("u32-literal", "u32_literal", CurrantU32Type); }
}
class CurrantU32Type extends CurrantType {
    varStorage(size) { return new Uint32Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}

class CurrantU64Node extends CurrantLiteralNode {
    constructor() { super("u64-literal", "u64_literal", CurrantU64Type); }
}
class CurrantU64Type extends CurrantType {
    varStorage(size) { return new BigUint64Array(size); }
    instNode(node) { return BigInt(node.value.substring(0, node.value.length - 3)); }
    instVal(value) {
        if(typeof value === "bigint") return value;
        return BigInt(Math.floor(value));
    }
}





// "currant/types/signedIntegers.js"

class CurrantI8Node extends CurrantLiteralNode {
    constructor() { super("i8-literal", "i8_literal", CurrantI8Type); }
}
class CurrantI8Type extends CurrantType {
    varStorage(size) { return new Int8Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 2)); }
    instVal(value) { return value; }
}

class CurrantI16Node extends CurrantLiteralNode {
    constructor() { super("i16-literal", "i16_literal", CurrantI16Type); }
}
class CurrantI16Type extends CurrantType {
    varStorage(size) { return new Int16Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}

class CurrantI32Node extends CurrantLiteralNode {
    constructor() { super("i32-literal", "i32_literal", CurrantI32Type); }
}
class CurrantI32Type extends CurrantType {
    varStorage(size) { return new Int32Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}

class CurrantI64Node extends CurrantLiteralNode {
    constructor() { super("i64-literal", "i64_literal", CurrantI64Type); }
}
class CurrantI64Type extends CurrantType {
    varStorage(size) { return new BigInt64Array(size); }
    instNode(node) { return BigInt(node.value.substring(0, node.value.length - 3)); }
    instVal(value) {
        if(typeof value === "bigint") return value;
        return BigInt(Math.floor(value));
    }
}





// "currant/types/boolean.js"

class CurrantBooleanNode extends CurrantLiteralNode {
    constructor() { super("bool-literal", "boolean_literal", CurrantBooleanType); }
}
class CurrantBooleanType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) { return node.value === "true"; }
    instVal(value) { return value; }
}



// "currant/types/floatingPoint.js"

class CurrantF32Node extends CurrantLiteralNode {
    constructor() { super("f32-literal", "f32_literal", CurrantF32Type); }
}
class CurrantF32Type extends CurrantType {
    varStorage(size) { return new Float32Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}

class CurrantF64Node extends CurrantLiteralNode {
    constructor() { super("f64-literal", "f64_literal", CurrantF64Type); }
}
class CurrantF64Type extends CurrantType {
    varStorage(size) { return new Float64Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}



// "currant/types/function.js"

class CurrantFunctionNode extends CurrantNode {

    constructor() { super("function"); }

    doParse() {
        let returnable = true;
        this.paramNames = [];
        let paramTypeNodes = [];
        let returnTypeNode = null;
        this.isTypeConstructor = false;
        if(super.token().name === "dollar") {
            this.isTypeConstructor = true;
            super.nextToken();
        }
        if(super.token().name === "opening_parenthesis") {
            super.expectToken("opening_parenthesis");
            super.nextToken();
            if(super.token().name !== "closing_parenthesis") {
                while(true) {
                    super.expectToken("identifier");
                    this.paramNames.push(super.token().text);
                    super.nextToken();
                    super.expectToken("colon");
                    super.nextToken();
                    if(super.token().name === "question_mark") {
                        paramTypeNodes.push(null);
                        super.nextToken();
                    } else paramTypeNodes.push(super.evalUntil(["comma", "closing_parenthesis"], false, false));
                    if(super.token().name === "closing_parenthesis") break;
                    super.expectToken("comma");
                    super.nextToken();
                }
            }
            super.expectToken("closing_parenthesis");
            super.nextToken();
            if(super.token().name === "arrow_right") {
                super.nextToken();
                returnTypeNode = super.evalUntil(["opening_brace"], false, false);
            }
        }
        if(super.token().name === "arrow_left") {
            returnable = false;
            super.nextToken();
        }
        super.expectToken("opening_brace");
        super.nextToken();
        let bodyTokens = [];
        let braceScope = 1;
        while(true) {
            if(super.token().name === "opening_brace") braceScope++;
            if(super.token().name === "closing_brace") braceScope--;
            if(super.token().name === "closing_brace" && braceScope === 0) break;
            bodyTokens.push(super.token());
            super.nextToken();
        }
        super.addChild(new CurrantBlockNode().setReturnable(returnable).parse(bodyTokens));
        super.expectEnd();
        this.returns = returnTypeNode !== null;
        if(this.returns) super.addChild(returnTypeNode);
        for(const paramTypeNode of paramTypeNodes)
            super.addChild(paramTypeNode);
    }

    prepareExecute() { this.executeChildren = false; }

    doExecute() {
        if(this.isTypeConstructor) return new CurrantTypeType().fromValue(new CurrantCustomType(new CurrantFunction(this)));
        return new CurrantFunctionType().fromNode(this);
    }

}
class CurrantFunctionType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) { return new CurrantFunction(node); }
    instVal(value) { return value; }
    val(instance) {
        let value = function currantFunction(...params) {
            for(let paramIndex = 0; paramIndex < params.length; paramIndex++) {
                let paramValue = params[paramIndex];
                if(paramValue instanceof CurrantVariableReference) paramValue = paramValue.get();
                if(!(paramValue instanceof CurrantTypeInstance))
                    throw new Error(`argument at index ${paramIndex} given to currant export function is not an instance of a currant type`);
            }
            let returnedValue = instance.call(params);
            if(returnedValue instanceof CurrantVariableReference) returnedValue = returnedValue.get();
            return returnedValue.getValue();
        };
        value.ref = instance;
        return value;
    }
    eq(a, b) {
        if(typeof a.ref !== "undefined" && typeof b.ref !== "undefined")
            return a.ref === b.ref;
        if(typeof a.body !== "undefined" && typeof b.body !== "undefined")
            return a.body.src === b.body.src && a.body.file === b.body.file && a.body.line === b.body.line;
        return false;
    }
}

class CurrantFunctionInterface {

    constructor() {
        if(typeof this.call !== "function")
            throw new Error(`${this.constructor.name} does not implement 'call(parameters)'`);
    }

}

class CurrantFunction extends CurrantFunctionInterface {

    constructor(functionNode) {
        super();
        this.file = functionNode.file;
        this.line = functionNode.line;
        this.body = functionNode.children[0];
        this.returnType = null;
        this.lastCallBody = null;
        let paramNodesOffset = 1;
        if(functionNode.returns) {
            this.returnType = functionNode.children[1];
            paramNodesOffset = 2;
        }
        this.paramTypes = new Array(functionNode.paramNames.length);
        this.paramNames = new Array(functionNode.paramNames.length);
        for(let i = 0; i < functionNode.paramNames.length; i++) {
            this.paramTypes[i] = functionNode.children[paramNodesOffset + i];
            this.paramNames[i] = functionNode.paramNames[i];
        }
    }

    call(paramValues, callRef, currentFile, currentLine) {
        if(paramValues.length !== this.paramTypes.length)
            throw new Error(`function call expected ${this.paramTypes.length} parameter(s), got ${paramValues.length} instead`);
        let bodyCopy = this.body.copy(this.body.block);
        bodyCopy.setAfterPrepare(() => {
            for(let paramIndex = 0; paramIndex < this.paramTypes.length; paramIndex++) {
                let paramTypeNode = this.paramTypes[paramIndex];
                let paramType = null;
                if(paramTypeNode !== null) {
                    paramTypeNode.setBlock(bodyCopy);
                    paramType = paramTypeNode.execute();
                }
                if(paramType instanceof CurrantVariableReference) paramType = paramType.get();
                let paramValue = paramValues[paramIndex];
                if(paramType !== null && !currantCompareTypes(paramType.get(), paramValue.type))
                    throw new Error(`unable to call function - value for argument "${this.paramNames[paramIndex]}" (index ${paramIndex}) is not of type "${paramTypeNode.src}"`);
                let paramName = this.paramNames[paramIndex];
                bodyCopy.createVariable(paramName, paramValue.copy());
            }
        });
        let resultType = null;
        if(typeof callRef === "undefined" || callRef === null) callRef = "(unknown)";
        if(typeof currentFile === "undefined" || currentFile === null) currentFile = "(unknown)";
        if(typeof currentLine === "undefined" || currentLine === null) currentLine = "(unknown)";
        bodyCopy.currant.stack.push(
                callRef,
                currentFile, currentLine,
                this.file, this.line
        );
        let result = bodyCopy.execute();
        this.lastCallBody = bodyCopy;
        if(this.returnType !== null) {
            this.returnType.setBlock(bodyCopy);
            resultType = this.returnType.execute();
            if(resultType instanceof CurrantVariableReference) resultType = resultType.get();
            if(result.type.constructor !== resultType.get().constructor)
                throw new Error(`function did not return value of type "${this.returnType.src}"`);
        } else {
            let nothingType = new CurrantNothingType();
            if(result.type.constructor !== nothingType.constructor)
                throw new Error(`function return expected nothing, got something instead`);
            result = nothingType.fromNode(null);
        }
        bodyCopy.currant.stack.pop();
        return result;
    }

}

class CurrantJsFunction extends CurrantFunctionInterface {

    constructor(functionReference) {
        super();
        this.ref = functionReference;
    }

    call(parameterValues) {
        let paramValues = new Array(parameterValues.length);
        for(let paramIndex = 0; paramIndex < parameterValues.length; paramIndex++) {
            let paramValue = parameterValues[paramIndex];
            if(paramValue instanceof CurrantVariableReference || paramValue instanceof CurrantBlockVariableWrapperObject)
                paramValue = paramValue.get();
            if(!(paramValue instanceof CurrantTypeInstance))
                throw new Error(`given argument at index ${paramIndex} has invalid type`);
            paramValues[paramIndex] = paramValue.getValue();
        }
        let returnedValue = this.ref(...paramValues);
        if(typeof returnedValue === "undefined") returnedValue = null;
        if(returnedValue === null) return new CurrantNothingType().fromNode(null);
        return returnedValue;
    }

}

class CurrantReturnNode extends CurrantNode {

    constructor() { super("return"); }

    doParse() {
        this.hasReturnValue = true;
        super.expectToken("arrow_right");
        if(!super.hasNextToken()) {
            super.expectEnd();
            this.hasReturnValue = false;
            return;
        }
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        if(this.hasReturnValue) this.block.returnValue(this.childValue(0));
        else this.block.returnValue(null);
    }

}

class CurrantFunctionCallNode extends CurrantNode {

    constructor() { super("function-call"); }

    doParse() {
        super.addChild(super.evalUntilLastScopeOpen("opening_parenthesis", "closing_parenthesis"));
        super.expectToken("opening_parenthesis");
        super.nextToken();
        if(super.token().name !== "closing_parenthesis") {
            while(true) {
                super.addChild(super.evalUntil(["closing_parenthesis", "comma"], false, false));
                if(super.token().name === "closing_parenthesis") break;
                super.expectToken("comma");
                super.nextToken();
            }
        }
        super.expectToken("closing_parenthesis");
        super.expectEnd();
    }

    doExecute() {
        let calledFunction = this.childValue(0);
        if(!(calledFunction.get() instanceof CurrantFunctionInterface) && !(calledFunction.get() instanceof CurrantCustomType))
            throw new Error(`unable to call function - "${this.children[0].src}" is not a function`);
        calledFunction = calledFunction.get();
        let parameterValues = new Array(this.children.length - 1);
        for(let i = 0; i < parameterValues.length; i++) {
            parameterValues[i] = this.childValue(i + 1);
        }
        return calledFunction.call(parameterValues, this.children[0].src, this.block.currant.currentFile, this.block.currant.currentLine);
    }

}



// "currant/types/nothing.js"

class CurrantNothingType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) { return null; }
    instVal(value) { return value; }
    val(instance) { return null; }
}



// "currant/types/pointer.js"

class CurrantPointerNode extends CurrantNode {

    constructor() { super("pointer"); }

    doParse() {
        super.expectToken("ampersand");
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        return new CurrantPointerType().fromNode(this);
    }

}

class CurrantPointerType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) {
        if(!(node.childValues[0] instanceof CurrantVariableReference))
            throw new Error("tried to create a pointer to something that is not a variable");
        return new CurrantPointer(node.childValues[0]);
    }
    instVal(value) { return value; }
    val(instance) { return new CurrantPointer(); }
}

class CurrantPointer {

    constructor(variableWrapper) {
        if(typeof variableWrapper === "undefined") return;
        this.ref = variableWrapper;
    }

}

class CurrantPointerDerefNode extends CurrantNode {

    constructor() { super("pointer-deref"); }

    doParse() {
        super.expectToken("asterisk");
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        let pointer = super.childValue(0);
        if(pointer.type.constructor !== CurrantPointerType)
            throw new Error("tried to dereference something that is not a pointer");
        return pointer.get().ref;
    }

}



// "currant/types/array.js"

class CurrantArrayNode extends CurrantNode {

    constructor() { super("array"); }

    doParse() {
        this.dynSized = false;
        super.expectToken("opening_bracket");
        super.nextToken();
        super.addChild(super.evalUntil(["colon", "closing_bracket"], false, false)); // [0] = type
        if(super.hasNextToken()) { // if end its not dynamic and it has no elements
            super.nextToken();
            super.addChild(super.evalUntil(["colon", "comma", "closing_bracket"], false, false)); // [1] = length / 1st element
            if(super.token().name === "colon") { // it's the length
                this.dynSized = true; // we are now dynamic baby
                super.nextToken();
                super.addChild(super.evalUntil(["closing_bracket"], false, false)); // [2] = value for all elements
            } else if(super.token().name === "comma") {
                super.nextToken();
                while(true) {
                    super.addChild(super.evalUntil(["comma", "closing_bracket"], false, false)); // [2..] = 2nd.. elements
                    if(super.token().name === "closing_bracket") break;
                    super.nextToken();
                }
            }
        }
        super.expectToken("closing_bracket");
        super.expectEnd();
    }

    doExecute() {
        this.itemType = super.childValue(0);
        if(!(this.itemType.get() instanceof CurrantType))
            throw new Error("unable to create array - specified type is not a type");
        this.values = [];
        if(this.dynSized) {
            let newLength = super.childValue(1);
            if(newLength.type.constructor !== CurrantU64Type)
                throw new Error("unable to create array - specified length is not an unsigned 64-bit integer");
            for(let i = 0; i < newLength.get(); i++) {
                this.values.push(super.childValue(2).copy());
            }
        } else {
            for(let i = 1; i < this.children.length; i++) {
                this.values.push(super.childValue(i).copy());
            }
        }
        for(let elementIndex = 0; elementIndex < this.values.length; elementIndex++) {
            if(!currantCompareTypes(this.values[elementIndex].type, this.itemType.get()))
                throw new Error(`unable to create array - type of element at index ${elementIndex} does not match array type`);
        }
        return new CurrantArrayType().fromNode(this);
    }

}

class CurrantArrayType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) { return new CurrantArray(node.itemType, node.values); }
    instVal(value) { return value; }
    val(instance) {
        let values = instance.values.slice(0, instance.values.length);
        for(let i = 0; i < values.length; i++) {
            values[i] = values[i].getValue();
        }
        values.ref = instance;
        return values;
    }
    eq(a, b) {
        if(!currantCompareTypes(a.itemType.get(), b.itemType.get())) return false;
        if(a.values.length !== b.values.length) return false;
        for(let index = 0; index < a.values.length; index++) {
            if(!a.values[index].equals(b.values[index])) return false;
        }
        return true;
    }
    copy(value) {
        let newValues = new Array(value.values.length);
        for(let index = 0; index < value.values.length; index++) {
            newValues[index] = value.values[index].copy();
        }
        return new CurrantArray(value.itemType, newValues);
    }
}

class CurrantArray {

    constructor(type, values) {
        this.itemType = type;
        this.values = values;
    }

}

class CurrantArrayAccessNode extends CurrantNode {

    constructor() { super("array-access"); }

    doParse() {
        super.addChild(super.evalUntilLastScopeOpen("opening_bracket", "closing_bracket"));
        super.nextToken();
        super.addChild(super.evalUntil(["closing_bracket", false, false]));
        super.expectEnd();
    }

    doExecute() {
        let accessedArray = super.childValue(0);
        if(accessedArray.type.constructor !== CurrantArrayType)
            throw new Error("tried array access on something that is not an array");
        let accessedIndex = super.childValue(1);
        if(accessedIndex.type.constructor !== CurrantU64Type)
            throw new Error("tried array access using an index that is not an unsigned 64-bit integer.");
        if(accessedIndex.get() >= accessedArray.get().values.length)
            throw new Error(`tried array access with out-of-bounds index (index ${accessedIndex.get()} is out of bounds of length ${accessedArray.get().values.length})`);
        return new CurrantVariableReference((value) => {
            accessedArray.get().values[accessedIndex.get()] = value;
        }, () => {
            return accessedArray.get().values[accessedIndex.get()];
        });
    }

}



// "currant/types/customType.js"

class CurrantCustomType extends CurrantType {

    constructor(constructorFunction) {
        super();
        this.constructorFunction = constructorFunction;
        if(this.constructorFunction.returnType !== null)
            throw new Error("type constructor function has a return type");
        if(!this.constructorFunction.body.returnable)
            throw new Error("type constructor function has a passing return");
        this._checkReturnNodes(this.constructorFunction.body);
    }

    _checkReturnNodes(node) {
        if(node === null) return;
        if(node.name === "return" && node.block !== null) {
            let returnedBlock = node.block;
            while(!returnedBlock.returnable) returnedBlock = returnedBlock.block;
            if(returnedBlock === this.constructorFunction.body)
                throw new Error("return call in type constructor function (or a function defined inside of it) would result in early return of the constructor function");
        }
        for(const nodeChild of node.children)
            this._checkReturnNodes(nodeChild);
    }

    varStorage(size) { return new Array(size); }
    instNode(node) { return null; }
    instVal(value) { return value; }
    copy(value) {
        return new CurrantCustomObject(value);
    }

    eq(a, b) {
        for(const varName of a.variables.keys()) {
            if(!b.variables.has(varName)) return false;
            if(!b.variables.get(varName).get().equals(a.variables.get(varName).get())) return false;
        }
        for(const varName of b.variables.keys()) {
            if(!a.variables.has(varName)) return false;
            if(!a.variables.get(varName).get().equals(b.variables.get(varName).get())) return false;
        }
        return true;
    }

    val(instance) {
        let convertedObject = {};
        for(const variableName of instance.variables.keys()) {
            let value = instance.variables.get(variableName);
            if(typeof value.upperBlockAccessName !== "undefined") continue;
            convertedObject[variableName] = value.get().getValue();
        }
        return convertedObject;
    }

    call(paramValues, callRef, currentFile, currentLine) {
        this.constructorFunction.call(paramValues, callRef, currentFile, currentLine);
        return this.fromValue(new CurrantCustomObject(this.constructorFunction.lastCallBody));
    }

}

class CurrantCustomObject {

    constructor(data) {
        this.variables = new Map(data.variables);
        for(const key of this.variables.keys())
            this.variables.set(key, new CurrantBlockVariableWrapperObject(this.variables.get(key).get().copy()));
        this.block = data.block;
    }

}

class CurrantMemberAccessNode extends CurrantNode {

    constructor() { super("member-access"); }

    doParse() {
        super.addChild(super.evalUntilLast(["dot"], true));
        super.nextToken();
        super.expectToken("identifier");
        this.member = super.token().text;
        super.expectEnd();
    }

    doExecute() {
        let object = super.childValue(0);
        if(object.type.constructor !== CurrantCustomType)
            throw new Error(`unable to access member - object does not have member "${this.member}"`);
        object = object.get();
        if(!object.variables.has(this.member))
            throw new Error(`unable to access member - object does not have member "${this.member}"`);
        return CurrantBlockNode.staticGetVariableRef(object.variables, object.parentBlock, this.member);
    }

}



// "currant/types/string.js"

class CurrantStringNode extends CurrantLiteralNode {
    constructor() { super("string-literal", "string_literal", CurrantStringType); }
}
class CurrantStringType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) { return node.value.substring(1, node.value.length - 1); }
    instVal(value) { return value; }
}



// "currant/defaults/types.js"

const CURRANT_STD_TYPES = `
    type: t@CurrantTypeType = t@CurrantTypeType;
    u8: type = t@CurrantU8Type;
    u16: type = t@CurrantU16Type;
    u32: type = t@CurrantU32Type;
    u64: type = t@CurrantU64Type;
    i8: type = t@CurrantI8Type;
    i16: type = t@CurrantI16Type;
    i32: type = t@CurrantI32Type;
    i64: type = t@CurrantI64Type;
    f32: type = t@CurrantF32Type;
    f64: type = t@CurrantF64Type;
    bool: type = t@CurrantBooleanType;
    none: type = t@CurrantNothingType;
    fun: type = t@CurrantFunctionType;
    ptr: type = t@CurrantPointerType;
    arr: type = t@CurrantArrayType;
    str: type = t@CurrantStringType;
`;



// "currant/defaults/console.js"

const CURRANT_STD_CONSOLE = `
    log: fun = f@currantLog;
    warn: fun = f@currantWarn;
    panic: fun = f@currantPanic;
`;

function currantLog(value) {
    console.log(currantToString(value).get());
}

function currantWarn(value) {
    console.warn(currantToString(value).get());
}

function currantPanic(value) {
    throw new Error(currantToString(value).get());
}



// "currant/defaults/conditions.js"

const CURRANT_STD_CONDITIONS = `
    if: fun = f@currantIf;
`;

function currantIf(condition, action) {
    if(typeof condition !== "boolean")
        throw new Error(`given argument at index 0 is not a boolean`);
    if(typeof action !== "function")
        throw new Error(`given argument at index 1 is not a function`);
    if(condition === true) action();
}




// "currant/defaults/math.js"

const CURRANT_STD_MATH = `

    len: fun = f@currantLen;

    MathFunctionsType: type = $() {

        E: f64 = 2.718281828459045f64;
        PI: f64 = 3.141592653589793f64;

        abs: fun = (x: ?) -> #x {
            if(x < numType~0u8, <- {
                -> numType~0u8 - x;
            });
            -> x;
        };

        min: fun = (a: ?, b: #a) -> #a {
            if(a < b, <- { -> a; });
            -> b;
        };

        max: fun = (a: ?, b: #a) -> #a {
            if(a > b, <- { -> a; });
            -> b;
        };

        powJsImpl: fun = f@currantPow;
        pow: fun = (x: ?, n: #x) -> #x {
            -> powJsImpl(#x, x, n);
        };

        sqrtJsImpl: fun = f@currantSqrt;
        sqrt: fun = (x: ?) -> #x {
            -> sqrtJsImpl(#x, x);
        };

        randomJsImpl: fun = f@currantRandom;
        random: fun = () -> f64 {
            -> randomJsImpl();
        };

        roundJsImpl: fun = f@currantRound;
        round: fun = (x: ?) -> #x {
            -> roundJsImpl(#x, x);
        };

        cbrtJsImpl: fun = f@currantCbrt;
        cbrt: fun = (x: ?) -> #x {
            -> cbrtJsImpl(#x, x);
        };

        ceilJsImpl: fun = f@currantCeil;
        ceil: fun = (x: ?) -> #x {
            -> ceilJsImpl(#x, x);
        };

        floorJsImpl: fun = f@currantFloor;
        floor: fun = (x: ?) -> #x {
            -> floorJsImpl(#x, x);
        };

        logJsImpl: fun = f@currantMathLog;
        log: fun = (x: ?) -> #x {
            -> logJsImpl(#x, x);
        };

        log10JsImpl: fun = f@currantLog10;
        log10: fun = (x: ?) -> #x {
            -> log10JsImpl(#x, x);
        };

        log1pJsImpl: fun = f@currantLog1p;
        log1p: fun = (x: ?) -> #x {
            -> log1pJsImpl(#x, x);
        };

        expJsImpl: fun = f@currantExp;
        exp: fun = (x: ?) -> #x {
            -> expJsImpl(#x, x);
        };

        expm1JsImpl: fun = f@currantExpm1;
        expm1: fun = (x: ?) -> #x {
            -> expm1JsImpl(#x, x);
        };

        sinJsImpl: fun = f@currantSin;
        sin: fun = (x: ?) -> #x {
            -> sinJsImpl(#x, x);
        };

        cosJsImpl: fun = f@currantCos;
        cos: fun = (x: ?) -> #x {
            -> cosJsImpl(#x, x);
        };

        tanJsImpl: fun = f@currantTan;
        tan: fun = (x: ?) -> #x {
            -> tanJsImpl(#x, x);
        };

        asinJsImpl: fun = f@currantAsin;
        asin: fun = (x: ?) -> #x {
            -> asinJsImpl(#x, x);
        };

        acosJsImpl: fun = f@currantAcos;
        acos: fun = (x: ?) -> #x {
            -> acosJsImpl(#x, x);
        };

        atanJsImpl: fun = f@currantAtan;
        atan: fun = (x: ?) -> #x {
            -> atanJsImpl(#x, x);
        };

        sinhJsImpl: fun = f@currantSinh;
        sinh: fun = (x: ?) -> #x {
            -> sinhJsImpl(#x, x);
        };

        coshJsImpl: fun = f@currantCosh;
        cosh: fun = (x: ?) -> #x {
            -> coshJsImpl(#x, x);
        };

        tanhJsImpl: fun = f@currantTanh;
        tanh: fun = (x: ?) -> #x {
            -> tanhJsImpl(#x, x);
        };

        toRadians: fun = (x: ?) -> #x {
            -> #x~(f64~x * Math.PI / 180f64);
        };
        radians: fun = toRadians;
        rad: fun = toRadians;

        toDegrees: fun = (x: ?) -> #x {
            -> #x~(f64~x * 180f64 / Math.PI);
        };
        degrees: fun = toDegrees;
        deg: fun = toDegrees;

    };
    Math: MathFunctionsType = MathFunctionsType();

`;

function currantLen(value) {
    if(typeof value.length === "undefined")
        throw new Error("parameter at index 0 is not an array or string");
    return currantCreateU64(value.length);
}

function currantMathFunNumCheck(values) {
    for(let i = 0; i < values.length; i++) {
        if(typeof values[i] !== "number" && typeof values[i] !== "bigint")
            throw new Error(`parameter at index ${i} is not a number`);
    }
}

function currantPow(numType, x, n) {
    currantMathFunNumCheck([x, n]);
    return numType.fromValue(Math.pow(Number(x), Number(n)));
}

function currantSqrt(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.sqrt(Number(x)));
}

function currantRandom() {
    return currantCreateF64(Math.random());
}

function currantRound(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.round(Number(x)));
}

function currantCbrt(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.cbrt(Number(x)));
}

function currantCeil(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.ceil(Number(x)));
}

function currantFloor(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.floor(Number(x)));
}

function currantMathLog(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.log(Number(x)));
}

function currantLog10(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.log10(Number(x)));
}

function currantLog1p(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.log1p(Number(x)));
}

function currantExp(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.exp(Number(x)));
}

function currantExpm1(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.expm1(Number(x)));
}

function currantSin(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.sin(Number(x)));
}

function currantCos(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.cos(Number(x)));
}

function currantTan(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.tan(Number(x)));
}

function currantAsin(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.asin(Number(x)));
}

function currantAcos(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.acos(Number(x)));
}

function currantAtan(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.atan(Number(x)));
}

function currantSinh(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.sinh(Number(x)));
}

function currantCosh(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.cosh(Number(x)));
}

function currantTanh(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.tanh(Number(x)));
}



// "currant/defaults/loops.js"

const CURRANT_STD_LOOPS = `
    lpa: type = u8;
    cont: lpa = 0u8;
    brk: lpa = 1u8;
    loop: fun = f@currantLoop;

    while: fun = (doExecute: fun, loopBody: fun) {
        loop(() -> lpa {
            if(!doExecute(), <- {
                -> brk;
            });
            -> loopBody();
        });
    };

    range: fun = (start: u64, end: u64) -> arr {
        rangeLength: u64 = Math.max(start, end) - Math.min(start, end);
        rangeArray: arr = [u64: rangeLength: 0u64];
        i: u64 = 0u64;
        while(() -> bool { -> i < rangeLength; }, () -> lpa {
            if(start < end, { rangeArray[i] = start + i; });
            if(start > end, { rangeArray[i] = start - i; });
            i = i + 1u64;
            -> cont;
        });
        -> rangeArray;
    };

    for: fun = (array: arr, loopBody: fun) {
        i: u64 = 0u64;
        while(() -> bool { -> i < len(array); }, () -> lpa {
            cAction: lpa = loopBody(array[i]);
            i = i + 1u64;
            -> cAction;
        });
    };
`;

function currantLoop(action) {
    if(typeof action !== "function")
        throw new Error(`given argument at index 0 is not a function`);
    while(true) {
        let actionValue = action();
        if(actionValue !== 0 && actionValue !== 1)
            throw new Error("loop body did not return continue ('cont') or break ('brk')");
        if(actionValue === 1) break;
    }
}



// "currant/defaults/boxes.js"

const CURRANT_STD_BOXES = `

    Box: type = $(val: ?) {

        getType: fun = () -> type {
            -> #val;
        };

        isSome: fun = () -> bool {
            -> getType() != none;
        };

        isNone: fun = () -> bool {
            -> getType() == none;
        };

        unwrap: fun = () -> #val {
            if(isNone(), { panic("Unwrapped a None-Box"); });
            -> val;
        };

        expect: fun = (message: str) -> #val {
            if(isNone(), { panic(message); });
            -> val;
        };

    };

    NoneBox: fun = () -> Box {
        -> Box({}());
    };

`;



// "currant/defaults/strings.js"

const CURRANT_STD_STRINGS = `

    StringFunctionsType: type = $() {

        toString: fun = f@currantToString;
        strOf: fun = toString;

        containsNum: fun = f@currantContainsNum;

        parseNumJsImpl: fun = f@currantParseNum;
        parseNum: fun = (numType: type, string: str) -> Box {
            if(!containsNum(string), <- {
                -> NoneBox();
            });
            -> Box(parseNumJsImpl(numType, string));
        };

        subStrJsImpl: fun = f@currantSubstr;
        subStr: fun = (string: str, start: u64, end: u64) -> str {
            if(start > end, {
                panic("start index (" + toString(start) + ") is greater than end index (" + toString(end) + ")");
            });
            if(end > len(string), {
                panic("end index (" + toString(end) + ") is out of bounds for string (length " + toString(len(string)) + ")");
            });
            -> subStrJsImpl(string, start, end);
        };

        startsWithJsImpl: fun = f@currantStartsWith;
        startsWith: fun = (string: str, prefix: str) -> bool {
            -> startsWithJsImpl(string, prefix);
        };

        endsWithJsImpl: fun = f@currantEndsWith;
        endsWith: fun = (string: str, suffix: str) -> bool {
            -> endsWithJsImpl(string, suffix);
        };

        containsJsImpl: fun = f@currantStrContains;
        contains: fun = (string: str, part: str) -> bool {
            -> containsJsImpl(string, part);
        };

        indexOfJsImpl: fun = f@currantStrIndexOf;
        indexOf: fun = (string: str, part: str) -> Box {
            if(!contains(string, part), <- { -> NoneBox(); });
            -> Box(indexOfJsImpl(string, part));
        };

        lastIndexOfJsImpl: fun = f@currantStrLastIndexOf;
        lastIndexOf: fun = (string: str, part: str) -> Box {
            if(!contains(string, part), <- { -> NoneBox(); });
            -> Box(lastIndexOfJsImpl(string, part));
        };

        toUpperJsImpl: fun = f@currantToUpper;
        toUpper: fun = (string: str) -> str {
            -> toUpperJsImpl(string);
        };

        toLowerJsImpl: fun = f@currantToLower;
        toLower: fun = (string: str) -> str {
            -> toLowerJsImpl(string);
        };

        trimJsImpl: fun = f@currantTrim;
        trim: fun = (string: str) -> str {
            -> trimJsImpl(string);
        };

    };
    String: StringFunctionsType = StringFunctionsType();

`;

function currantToString(value) {
    if(value === null) return currantCreateStr("[none]");
    if(value instanceof CurrantPointer) return currantCreateStr("[pointer]");
    if(value instanceof CurrantType) return currantCreateStr("[type]");
    if(value instanceof Array) return currantArrayToString(value);
    if(typeof value === "function") return currantCreateStr("[function]");
    if(typeof value === "object") return currantCreateStr("[object]");
    return currantCreateStr(String(value));
}

function currantArrayToString(array) {
    let result = "[array: ";
    for(const element of array) {
        result += currantToString(element).get() + ", ";
    }
    return currantCreateStr(result.substring(0, result.length - 2) + "]");
}

function currantContainsNum(string) {
    if(string.length === 0) return currantCreateBool(false);
    return currantCreateBool(!isNaN(string));
}

function currantParseNum(numType, string) {
    return numType.fromValue(string);
}

function currantSubstr(string, start, end) {
    return currantCreateStr(string.substring(Number(start), Number(end)));
}

function currantStartsWith(string, prefix) {
    return currantCreateBool(string.startsWith(prefix));
}

function currantEndsWith(string, suffix) {
    return currantCreateBool(string.endsWith(suffix));
}

function currantStrContains(string, part) {
    return currantCreateBool(string.includes(part));
}

function currantStrIndexOf(string, part) {
    return currantCreateU64(string.indexOf(part));
}

function currantStrLastIndexOf(string, part) {
    return currantCreateU64(string.lastIndexOf(part));
}

function currantToUpper(string) {
    return currantCreateStr(string.toUpperCase());
}

function currantToLower(string) {
    return currantCreateStr(string.toLowerCase());
}

function currantTrim(string) {
    return currantCreateStr(string.trim());
}



// "currant/defaults/time.js"

const CURRANT_STD_TIME = `

    TimeFunctionsType: type = $() {

        millis: fun = f@currantTimeMillis;

        seconds: fun = f@currantTimeSeconds;

        sleepJsImpl: fun = f@currantSleep;
        sleepAsync: fun = (action: fun, timeout: u64) {
            sleepJsImpl(action, timeout);
        };

    };
    Time: TimeFunctionsType = TimeFunctionsType();

`;

function currantTimeMillis() {
    return currantCreateU64(Date.now());
}

function currantTimeSeconds() {
    return currantCreateU64(Math.floor(Date.now() / 1000));
}

function currantSleep(func, timeout) { // timeout is in millis
    setTimeout(func, Number(timeout));
}



// "currant/defaults/arrays.js"

const CURRANT_STD_ARRAYS = `

    ArrayFunctionsType: type = $() {

        itemType: fun = f@currantArrayItemType;

        reverse: fun = (src: arr) -> arr {
            if(len(src) == 0u64, <- { -> [itemType(src): 0u64, 0u8]; });
            dest: arr = [itemType(src): len(src): src[0u64]];
            for(range(0u64, len(src)), (i: u64) -> lpa {
                dest[len(src) - 1u64 - i] = src[i];
                -> cont;
            });
            -> dest;
        };
        rev: fun = reverse;

        copyRange: fun = (src: arr, start: u64, end: u64) -> arr {
            destLength: u64 = Math.max(start, end) - Math.min(start, end);
            if(destLength == 0u64, <- { -> [itemType(src): 0u64: 0u8]; });
            dest: arr = [itemType(src): destLength: src[0u64]];
            destIndex: u64 = 0u64;
            for(range(start, end), (srcIndex: u64) -> lpa {
                dest[destIndex] = src[srcIndex];
                destIndex = destIndex + 1u64;
                -> cont;
            });
            -> dest;
        };

        copyInto: fun = (src: arr, srcStart: u64, dest: arr, destStart: u64, elements: u64) {
            for(range(0u64, elements), (i: u64) -> lpa {
                dest[destStart + i] = src[srcStart + i];
                -> cont;
            });
        };

        addAt: fun = (src: arr, index: u64, item: itemType(src)) -> arr {
            dest: arr = [itemType(src): len(src) + 1u64: item];
            copyInto(src, 0u64, dest, 0u64, index);
            dest[index] = item;
            copyInto(src, index, dest, index + 1u64, len(src) - index);
            -> dest;
        };

        add: fun = (src: arr, item: itemType(src)) -> arr {
            -> addAt(src, len(src), item);
        };

        append: fun = (src: arr, items: arr) -> arr {
            if(itemType(src) != itemType(items), { panic("item types of the given arrays do not match"); });
            if(len(src) == 0u64, <- { -> items; });
            if(len(items) == 0u64, <- { -> src; });
            dest: arr = [itemType(src): len(src) + len(items): src[0u64]];
            copyInto(src, 0u64, dest, 0u64, len(src));
            copyInto(items, 0u64, dest, len(src), len(items));
            -> dest;
        };

        indexOf: fun = (src: arr, item: itemType(src)) -> Box {
            result: Box = NoneBox();
            for(reverse(range(0u64, len(src))), (i: u64) -> lpa {
                if(src[i] == item, { result = Box(i); });
                -> cont;
            });
            -> result;
        };

        lastIndexOf: fun = (src: arr, item: itemType(src)) -> Box {
            result: Box = NoneBox();
            for(range(0u64, len(src)), (i: u64) -> lpa {
                if(src[i] == item, { result = Box(i); });
                -> cont;
            });
            -> result;
        };

        contains: fun = (src: arr, item: itemType(src)) -> bool {
            -> indexOf(src, item).isSome();
        };

        containsAll: fun = (src: arr, items: arr) -> bool {
            if(itemType(src) != itemType(items), { panic("item types of the given arrays do not match"); });
            if(len(items) == 0u64, <- { -> true; });
            if(len(src) == 0u64, <- { -> false; });
            notFound: bool = false;
            for(items, (item: itemType(items)) -> lpa {
                if(!contains(src, item), <- {
                    notFound = true;
                    -> brk;
                });
                -> cont;
            });
            -> !notFound;
        };

        removeAt: fun = (src: arr, index: u64) -> arr {
            if(len(src) == 0u64, { panic("given array is already empty"); });
            dest: arr = [itemType(src): len(src) - 1u64: src[0u64]];
            copyInto(src, 0u64, dest, 0u64, index);
            copyInto(src, index + 1u64, dest, index, len(dest) - index);
            -> dest;
        };

        remove: fun = (src: arr, item: itemType(src)) -> arr {
            removalIndex: Box = indexOf(src, item);
            if(removalIndex.isNone(), <- { -> src; });
            -> removeAt(src, removalIndex.unwrap());
        };

        removeLast: fun = (src: arr, item: itemType(src)) -> arr {
            removalIndex: Box = lastIndexOf(src, item);
            if(removalIndex.isNone(), <- { -> src; });
            -> removeAt(src, removalIndex.unwrap());
        };

    };
    Array: ArrayFunctionsType = ArrayFunctionsType();

`;

function currantArrayItemType(array) {
    if(typeof array.ref === "undefined" || !(array.ref instanceof CurrantArray))
        throw new Error("parameter at index 0 is not an array");
    return array.ref.itemType;
}



// "currant/defaults/maps.js"

const CURRANT_STD_MAPS = `

    Map: type = $(keyType: type, valType: type) {



    };

`;



// "currant/stack.js"

class CurrantStack {

    constructor() {
        this.elements = [];
    }

    produceStackTrace(currentFile, currentLine, reason) {
        if(currentFile === null) currentFile = "(unknown)";
        if(currentLine === null) currentLine = "(unknown)";
        let output = `Script "${currentFile}" panicked on line ${currentLine}: ${reason}`;
        for(const element of this.elements.slice(0, this.elements.length).reverse()) {
            output += "\n" + `    called "${element.callRef}" - called from "${element.callFile}" on line ${element.callLine} - defined at "${element.srcFile}" on line ${element.srcLine}`;
        }
        return output;
    }

    push(callRef, callFile, callLine, srcFile, srcLine) {
        if(callFile === null) callFile = "(unknown)";
        if(callLine === null) callLine = "(unknown)";
        if(srcFile === null) srcFile = "(unknown)";
        if(srcLine === null) srcLine = "(unknown)";
        this.elements.push({
            callRef,
            callFile,
            callLine,
            srcFile,
            srcLine
        });
    }

    pop() {
        this.elements.pop();
    }

    clear() {
        this.elements = [];
    }

}



// "currant/scriptLoader.js"

class CurrantScriptLoader {

    constructor() {
        this.queue = [];
        this.running = false;
    }

    execute() {
        if(this.queue.length === 0 || this.running) return;
        this.running = true;
        currant.currentFile = this.queue[0];
        currant.currentLine = 0;
        let fileRequest = fetch(this.queue[0]).then(response => {
            if(response.status === 200) return response.text();
            else throw new Error(`[${response.status}] ${response.statusText}`);
        }).then(scriptText => {
            currant.run(scriptText, this.queue[0]);
        }).catch(error => {
            currant.handleError(error);
        }).finally(() => {
            this.finishExecute();
        });
    }

    finishExecute() {
        this.running = false;
        this.queue.shift();
        this.execute();
    }

    queueFile(fileName) {
        this.queue.push(fileName);
        if(!this.running) this.execute();
    }

}



// "currant/currant.js"

// the currant interpreter
class Currant {

    constructor() {
        this.preprocessor = new CurrantPreprocessor();
        this.lexer = new CurrantLexer();
        this.lastBlockNode = null;
        this.currentFile = null;
        this.currentLine = 0;
        this.scriptTagName = "currant-script";
        this.showInterpreterStackTrace = false;
        this.stack = new CurrantStack();
        this.loader = new CurrantScriptLoader();
        this._loadDefaults();
    }

    _loadDefaults() {
        this.run(CURRANT_STD_TYPES, "std.types.crn");
        this.run(CURRANT_STD_CONSOLE, "std.console.crn");
        this.run(CURRANT_STD_CONDITIONS, "std.conditions.crn");
        this.run(CURRANT_STD_MATH, "std.math.crn");
        this.run(CURRANT_STD_LOOPS, "std.loops.crn");
        this.run(CURRANT_STD_BOXES, "std.boxes.crn");
        this.run(CURRANT_STD_STRINGS, "std.strings.crn");
        this.run(CURRANT_STD_TIME, "std.time.crn");
        this.run(CURRANT_STD_ARRAYS, "std.arrays.crn");
        this.run(CURRANT_STD_MAPS, "std.maps.crn");
    }

    handleError(error) {
        console.error(this.stack.produceStackTrace(this.currentFile, this.currentLine, error.message));
        if(this.showInterpreterStackTrace) throw error;
    }

    run(scriptText, fileName) {
        this.stack.clear();
        try {
            if(typeof fileName === "undefined") fileName = null;
            // preprocessor
            let processedText = this.preprocessor.process(scriptText);
            // lexer
            let tokens = this.lexer.tokenize(processedText, fileName);
            for(const token of tokens) token.currant = this; // attach runtime reference to tokens (for errors during parsing)
            // parsing
            let blockNode = new CurrantBlockNode().setRuntime(this).parse(tokens);
            blockNode.block = this.lastBlockNode;
            // execution
            let executeResult = blockNode.execute();
            this.lastBlockNode = blockNode;
            if(executeResult === null) return executeResult;
            else return executeResult.getValue();
        } catch(error) {
            this.handleError(error);
        }
    }

}
const currant = new Currant();



// "currant/currantScript.js"

// defines a currant script
class CurrantScript extends HTMLElement {

    constructor() {
        super();
        // on load
        addEventListener("load", (e) => {
            // hide the element
            this.style.display = "none";
            this.type = "text/plain";
            // load script sources and parse
            if(this.hasAttribute("src")) {
                currant.loader.queueFile(this.getAttribute("src"));
            } else {
                console.warn(`'${currant.scriptTagName}'-element did not specify attribute 'src'.`);
            }
        });
    }

}

// register the tag
customElements.define(currant.scriptTagName, CurrantScript);


