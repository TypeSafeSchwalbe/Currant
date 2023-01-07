
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