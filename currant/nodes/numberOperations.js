
function currantGetNumberTypes() {
    return [
        CurrantI8Type, CurrantI16Type, CurrantI32Type, CurrantI64Type,
        CurrantU8Type, CurrantU16Type, CurrantU32Type, CurrantU64Type,
        CurrantF32Type, CurrantF64Type
    ];
}

class CurrantCastNumberNode extends CurrantNode {

    constructor() { super("cast-number"); }

    doParse() {
        super.addChild(super.evalUntil(["tilde"], false, false));
        super.expectToken("tilde");
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        let convertType = super.childValue(0).get();
        let number = super.childValue(1).get();
        let numberType = super.childValue(1).type;
        if(!currantGetNumberTypes().includes(numberType.constructor))
            throw new Error(`failed to cast between number types - "${this.children[1].src}" is not a number`);
        if(!currantGetNumberTypes().includes(convertType.constructor))
            throw new Error(`failed to cast between number types - "${this.children[0].src}" is not a number type`);
        let numberTypeIsBigInt = numberType.constructor === CurrantI64Type || numberType.constructor === CurrantU64Type;
        let convertTypeIsBigInt = convertType.constructor === CurrantI64Type || convertType.constructor === CurrantU64Type;
        if(numberTypeIsBigInt && !convertTypeIsBigInt)
            number = Number(number);
        if(!numberTypeIsBigInt && convertTypeIsBigInt)
            number = BigInt(number);
        return convertType.fromValue(number);
    }

}

class CurrantAdditiveNode extends CurrantNode {

    constructor() { super("additive"); }

    doParse() {
        super.addChild(super.evalUntilLast(["plus", "minus"], true));
        this.operation = super.token().text;
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        if(!currantCompareTypes(super.childValue(0).type, super.childValue(1).type))
            throw new Error(`unable to do arithmetic operation (or string concatenation) - "${this.children[0].src}" and "${this.children[1].src}" do not have the same type`);
        if(!currantGetNumberTypes().includes(super.childValue(0).type.constructor) && super.childValue(0).type.constructor !== CurrantStringType)
            throw new Error(`unable to do arithmetic operation (or string concatenation) - "${this.children[0].src}" is not a number or string`);
        if(this.operation !== "+" && super.childValue(0).type.constructor === CurrantStringType)
            throw new Error(`unable to do arithmetic operation - "${this.children[0].src}" is not a number`);
        let resultStorage = super.childValue(0).type.varStorage(1);
        switch(this.operation) {
            case "+": resultStorage[0] = super.childValue(0).get() + super.childValue(1).get(); break;
            case "-": resultStorage[0] = super.childValue(0).get() - super.childValue(1).get(); break;
        }
        return new CurrantTypeInstance(super.childValue(0).type, resultStorage);
    }

}

class CurrantMultiplicativeNode extends CurrantNode {

    constructor() { super("multiplicative"); }

    doParse() {
        super.addChild(super.evalUntilLast(["asterisk", "slash", "percent"], true));
        this.operation = super.token().text;
        super.nextToken();
        super.addChild(super.evalUntil(null, false, false));
        super.expectEnd();
    }

    doExecute() {
        if(!currantCompareTypes(super.childValue(0).type, super.childValue(1).type))
            throw new Error(`unable to do arithmetic operation - "${this.children[0].src}" and "${this.children[1].src}" do not have the same type`);
        if(!currantGetNumberTypes().includes(super.childValue(0).type.constructor))
            throw new Error(`unable to do arithmetic operation - "${this.children[0].src}" is not a number`);
        let resultStorage = super.childValue(0).type.varStorage(1);
        switch(this.operation) {
            case "*": resultStorage[0] = super.childValue(0).get() * super.childValue(1).get(); break;
            case "/": resultStorage[0] = super.childValue(0).get() / super.childValue(1).get(); break;
            case "%": resultStorage[0] = super.childValue(0).get() % super.childValue(1).get(); break;
        }
        return new CurrantTypeInstance(super.childValue(0).type, resultStorage);
    }

}