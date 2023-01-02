
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