
class CurrantInvalidValueError extends Error {
    constructor() { super(`Invalid value for variable`); }
}

class CurrantType {

    constructor() {
        if(typeof this.varStorage !== "function")
            throw new Error(`"${this.constructor.name}" does not implement 'varStorage(size)'`);
        if(typeof this.instNode !== "function")
            throw new Error(`"${this.constructor.name}" does not implement 'instNode(node)'`);
        if(typeof this.instVal !== "function")
            throw new Error(`"${this.constructor.name}" does not implement 'instVal(value)'`);
    }

    fromNode(node) {
        let variableStorage = this.varStorage(1);
        variableStorage[0] = this.instNode(node);
        return new CurrantTypeInstance(this, variableStorage);
    }

    fromValue(value) {
        let variableStorage = this.varStorage(1);
        variableStorage[0] = this.instVal(value);
        return new CurrantTypeInstance(this, variableStorage);
    }

}

class CurrantTypeInstance {

    constructor(type, varStorage) {
        this.type = type;
        this.value = varStorage;
    }

    get() {
        return this.value[0];
    }

    equals(otherInstance) {
        if(!currantCompareTypes(this.type, otherInstance.type)) return false;
        if(typeof this.type.eq !== "function") return this.get() === otherInstance.get();
        return this.type.eq(this.get(), otherInstance.get());
    }

    getValue() {
        if(typeof this.type.val !== "function") return this.get();
        return this.type.val(this.get());
    }

    copy() {
        if(typeof this.type.copy !== "function") return this.type.fromValue(this.value[0]);
        return this.type.fromValue(this.type.copy(this.value[0]));
    }

}



class CurrantVariableReference {

    constructor(setter, getter) {
        this.set = setter;
        this.get = getter;
    }

}



class CurrantTypeType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) { return null; }
    instVal(value) { return value; }
    eq(val1, val2) { return currantCompareTypes(val1, val2); }
}