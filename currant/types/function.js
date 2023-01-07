
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