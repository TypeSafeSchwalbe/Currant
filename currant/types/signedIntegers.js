
class CurrantI8Node extends CurrantLiteralNode {
    constructor() { super("i8-literal", "i8_literal", CurrantI8Type); }
}
class CurrantI8Type extends CurrantType {
    varStorage(size) { return new Int8Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 2)); }
    instVal(value) { return value; }
}

class CurrantI16Node extends CurrantLiteralNode {
    constructor() { super("i16-literal", "i16_literal", CurrantI16Type); }
}
class CurrantI16Type extends CurrantType {
    varStorage(size) { return new Int16Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}

class CurrantI32Node extends CurrantLiteralNode {
    constructor() { super("i32-literal", "i32_literal", CurrantI32Type); }
}
class CurrantI32Type extends CurrantType {
    varStorage(size) { return new Int32Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}

class CurrantI64Node extends CurrantLiteralNode {
    constructor() { super("i64-literal", "i64_literal", CurrantI64Type); }
}
class CurrantI64Type extends CurrantType {
    varStorage(size) { return new BigInt64Array(size); }
    instNode(node) { return BigInt(node.value.substring(0, node.value.length - 3)); }
    instVal(value) {
        if(typeof value === "bigint") return value;
        return BigInt(Math.floor(value));
    }
}

