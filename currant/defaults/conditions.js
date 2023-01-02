
const CURRANT_STD_CONDITIONS = `
    if: fun = f@currantIf;
`;

function currantIf(condition, action) {
    if(typeof condition !== "boolean")
        throw new Error(`given argument at index 0 is not a boolean`);
    if(typeof action !== "function")
        throw new Error(`given argument at index 1 is not a function`);
    if(condition === true) action();
}
