
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
        return value.type.fromValue(!value.get());
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