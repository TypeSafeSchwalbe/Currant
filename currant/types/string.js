
class CurrantStringNode extends CurrantLiteralNode {
    constructor() { super("string-literal", "string_literal", CurrantStringType); }
}
class CurrantStringType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) {
        let content = node.value.substring(1, node.value.length - 1);
        let scannedIndex = 0;
        while(scannedIndex < content.length) {
            if(content.substr(scannedIndex, 2).startsWith("\\")) {
                if(content.substr(scannedIndex, 2).startsWith("\\n"))
                     content = content.substring(0, scannedIndex) + "\n" + content.substring(scannedIndex + 2, content.length);
                else content = content.substring(0, scannedIndex) + content.substring(scannedIndex + 1, content.length);
                scannedIndex++;
            }
            scannedIndex++;
        }
        return content;
    }
    instVal(value) { return value; }
}