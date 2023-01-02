
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