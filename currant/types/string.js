
class CurrantStringNode extends CurrantLiteralNode {
    constructor() { super("string-literal", "string_literal", CurrantStringType); }
}
class CurrantStringType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) { return node.value.substring(1, node.value.length - 1); }
    instVal(value) { return value; }
}