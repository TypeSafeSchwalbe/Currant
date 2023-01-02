
class CurrantBooleanNode extends CurrantLiteralNode {
    constructor() { super("bool-literal", "boolean_literal", CurrantBooleanType); }
}
class CurrantBooleanType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) { return node.value === "true"; }
    instVal(value) { return value; }
}