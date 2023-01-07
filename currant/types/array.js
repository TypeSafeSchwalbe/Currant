
class CurrantArrayNode extends CurrantNode {

    constructor() { super("array"); }

    doParse() {
        this.dynSized = false;
        super.expectToken("opening_bracket");
        super.nextToken();
        super.addChild(super.evalUntil(["colon", "closing_bracket"], false, false)); // [0] = type
        if(super.hasNextToken()) { // if end its not dynamic and it has no elements
            super.nextToken();
            super.addChild(super.evalUntil(["colon", "comma", "closing_bracket"], false, false)); // [1] = length / 1st element
            if(super.token().name === "colon") { // it's the length
                this.dynSized = true; // we are now dynamic baby
                super.nextToken();
                super.addChild(super.evalUntil(["closing_bracket"], false, false)); // [2] = value for all elements
            } else if(super.token().name === "comma") {
                super.nextToken();
                while(true) {
                    super.addChild(super.evalUntil(["comma", "closing_bracket"], false, false)); // [2..] = 2nd.. elements
                    if(super.token().name === "closing_bracket") break;
                    super.nextToken();
                }
            }
        }
        super.expectToken("closing_bracket");
        super.expectEnd();
    }

    doExecute() {
        this.itemType = super.childValue(0);
        if(!(this.itemType.get() instanceof CurrantType))
            throw new Error("unable to create array - specified type is not a type");
        this.values = [];
        if(this.dynSized) {
            let newLength = super.childValue(1);
            if(newLength.type.constructor !== CurrantU64Type)
                throw new Error("unable to create array - specified length is not an unsigned 64-bit integer");
            for(let i = 0; i < newLength.get(); i++) {
                this.values.push(super.childValue(2).copy());
            }
        } else {
            for(let i = 1; i < this.children.length; i++) {
                this.values.push(super.childValue(i).copy());
            }
        }
        for(let elementIndex = 0; elementIndex < this.values.length; elementIndex++) {
            if(!currantCompareTypes(this.values[elementIndex].type, this.itemType.get()))
                throw new Error(`unable to create array - type of element at index ${elementIndex} does not match array type`);
        }
        return new CurrantArrayType().fromNode(this);
    }

}

class CurrantArrayType extends CurrantType {
    varStorage(size) { return new Array(size); }
    instNode(node) { return new CurrantArray(node.itemType, node.values); }
    instVal(value) { return value; }
    val(instance) {
        let values = instance.values.slice(0, instance.values.length);
        for(let i = 0; i < values.length; i++) {
            values[i] = values[i].getValue();
        }
        values.ref = instance;
        return values;
    }
    eq(a, b) {
        if(!currantCompareTypes(a.itemType.get(), b.itemType.get())) return false;
        if(a.values.length !== b.values.length) return false;
        for(let index = 0; index < a.values.length; index++) {
            if(!a.values[index].equals(b.values[index])) return false;
        }
        return true;
    }
    copy(value) {
        let newValues = new Array(value.values.length);
        for(let index = 0; index < value.values.length; index++) {
            newValues[index] = value.values[index].copy();
        }
        return new CurrantArray(value.itemType, newValues);
    }
}

class CurrantArray {

    constructor(type, values) {
        this.itemType = type;
        this.values = values;
    }

}

class CurrantArrayAccessNode extends CurrantNode {

    constructor() { super("array-access"); }

    doParse() {
        super.addChild(super.evalUntilLastScopeOpen("opening_bracket", "closing_bracket"));
        super.nextToken();
        super.addChild(super.evalUntil(["closing_bracket", false, false]));
        super.expectEnd();
    }

    doExecute() {
        let accessedArray = super.childValue(0);
        if(accessedArray.type.constructor !== CurrantArrayType)
            throw new Error("tried array access on something that is not an array");
        let accessedIndex = super.childValue(1);
        if(accessedIndex.type.constructor !== CurrantU64Type)
            throw new Error("tried array access using an index that is not an unsigned 64-bit integer.");
        if(accessedIndex.get() >= accessedArray.get().values.length)
            throw new Error(`tried array access with out-of-bounds index (index ${accessedIndex.get()} is out of bounds of length ${accessedArray.get().values.length})`);
        return new CurrantVariableReference((value) => {
            accessedArray.get().values[accessedIndex.get()] = value;
        }, () => {
            return accessedArray.get().values[accessedIndex.get()];
        });
    }

}