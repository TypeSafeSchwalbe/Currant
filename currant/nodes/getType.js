
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