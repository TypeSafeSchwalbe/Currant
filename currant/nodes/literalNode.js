
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