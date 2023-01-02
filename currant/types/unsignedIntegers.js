
class CurrantU8Node extends CurrantLiteralNode {
    constructor() { super("u8-literal", "u8_literal", CurrantU8Type); }
}
class CurrantU8Type extends CurrantType {
    varStorage(size) { return new Uint8Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 2)); }
    instVal(value) { return value; }
}

class CurrantU16Node extends CurrantLiteralNode {
    constructor() { super("u16-literal", "u16_literal", CurrantU16Type); }
}
class CurrantU16Type extends CurrantType {
    varStorage(size) { return new Uint16Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}

class CurrantU32Node extends CurrantLiteralNode {
    constructor() { super("u32-literal", "u32_literal", CurrantU32Type); }
}
class CurrantU32Type extends CurrantType {
    varStorage(size) { return new Uint32Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}

class CurrantU64Node extends CurrantLiteralNode {
    constructor() { super("u64-literal", "u64_literal", CurrantU64Type); }
}
class CurrantU64Type extends CurrantType {
    varStorage(size) { return new BigUint64Array(size); }
    instNode(node) { return BigInt(node.value.substring(0, node.value.length - 3)); }
    instVal(value) {
        if(typeof value === "bigint") return value;
        return BigInt(Math.floor(value));
    }
}

