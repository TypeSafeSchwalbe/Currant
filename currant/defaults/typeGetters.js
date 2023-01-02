
const CURRANT_STD_TYPE_GETTERS = `
    arrType: fun = f@currantArrayItemType;
`;

function currantArrayItemType(array) {
    if(typeof array.ref === "undefined" || !(array.ref instanceof CurrantArray))
        throw new Error("parameter at index 0 is not an array");
    return array.ref.itemType;
}