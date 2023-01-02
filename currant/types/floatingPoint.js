
class CurrantF32Node extends CurrantLiteralNode {
    constructor() { super("f32-literal", "f32_literal", CurrantF32Type); }
}
class CurrantF32Type extends CurrantType {
    varStorage(size) { return new Float32Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}

class CurrantF64Node extends CurrantLiteralNode {
    constructor() { super("f64-literal", "f64_literal", CurrantF64Type); }
}
class CurrantF64Type extends CurrantType {
    varStorage(size) { return new Float64Array(size); }
    instNode(node) { return Number(node.value.substring(0, node.value.length - 3)); }
    instVal(value) { return value; }
}