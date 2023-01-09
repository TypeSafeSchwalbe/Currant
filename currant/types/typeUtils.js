
function currantCompareTypes(a, b) {
    if(a instanceof CurrantCustomType && b instanceof CurrantCustomType) {
        return a.constructorFunction.file === b.constructorFunction.file
            && a.constructorFunction.line === b.constructorFunction.line
            && a.constructorFunction.src === b.constructorFunction.src;
    }
    return a.constructor === b.constructor;
}

function currantCreateDoNumCheck(value) {
    if(typeof value !== "number" && typeof value !== "bigint")
        throw new Error("tried to create Currant number type instance from something that is not a number");
}

function currantCreateU8(value) {
    currantCreateDoNumCheck(value);
    return new CurrantU8Type().fromValue(Number(value));
}
function currantCreateU16(value) {
    currantCreateDoNumCheck(value);
    return new CurrantU16Type().fromValue(Number(value));
}
function currantCreateU32(value) {
    currantCreateDoNumCheck(value);
    return new CurrantU32Type().fromValue(Number(value));
}
function currantCreateU64(value) {
    currantCreateDoNumCheck(value);
    return new CurrantU64Type().fromValue(BigInt(Number(value)));
}

function currantCreateI8(value) {
    currantCreateDoNumCheck(value);
    return new CurrantI8Type().fromValue(Number(value));
}
function currantCreateI16(value) {
    currantCreateDoNumCheck(value);
    return new CurrantI16Type().fromValue(Number(value));
}
function currantCreateI32(value) {
    currantCreateDoNumCheck(value);
    return new CurrantI32Type().fromValue(Number(value));
}
function currantCreateI64(value) {
    currantCreateDoNumCheck(value);
    return new CurrantI64Type().fromValue(BigInt(Number(value)));
}

function currantCreateF32(value) {
    currantCreateDoNumCheck(value);
    return new CurrantF32Type().fromValue(Number(value));
}
function currantCreateF64(value) {
    currantCreateDoNumCheck(value);
    return new CurrantF64Type().fromValue(Number(value));
}

function currantCreateBool(value) {
    if(typeof value !== "boolean")
        throw new Error("tried to create Currant boolean type instance from something that is not a boolean");
    return new CurrantBooleanType().fromValue(value);
}

function currantCreateFun(value) {
    if(typeof value !== "function")
        throw new Error("tried to create Currant function type instance from something that is not a function");
    return new CurrantFunctionType().fromValue(new CurrantJsFunction(value));
}

function currantCreateArray(value) {
    if(value.constructor !== Array)
        throw new Error("tried to create Currant array type instance from something that is not an array");
    return new CurrantArrayType().fromValue(new CurrantArray(value));
}

function currantCreateStr(value) {
    if(typeof value !== "string")
        throw new Error("tried to create Currant str type instance from something that is not a string");
    return new CurrantStringType().fromValue(value);
}