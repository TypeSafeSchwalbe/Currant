
class CurrantPointerNode extends CurrantNode {

    constructor() { super("pointer"); }

    doParse() {
        super.expectToken("ampersand");
        super.nextToken();
        super.expectToken("identifier");
        this.refName = super.token().text;
        super.expectEnd();
    }

    doExecute() {
        this.ref = CurrantBlockNode.staticGetVariableWrapper(this.block.variables, this.block.block, this.refName);
        return new CurrantPointerType().fromNode(this);
    }

}

class CurrantPointerType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) {
        if(!(node.ref instanceof CurrantBlockVariableWrapperObject))
            throw new Error("tried to create a pointer to something that is not a variable");
        return new CurrantPointer(node.ref);
    }
    instVal(value) { return value; }
    val(instance) { return new CurrantPointer(); }
    eq(a, b) {
        return a.ref === b.ref;
    }
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
        return new CurrantVariableReference((value) => {
            pointer.get().ref.value = value;
        }, () => {
            return pointer.get().ref.value;
        });
    }

}