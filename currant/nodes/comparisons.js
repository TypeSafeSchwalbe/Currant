
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