
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