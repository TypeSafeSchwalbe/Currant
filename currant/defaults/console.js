
const CURRANT_STD_CONSOLE = `
    log: fun = f@currantLog;
    warn: fun = f@currantWarn;
    panic: fun = f@currantPanic;
`;

function currantLog(value) {
    console.log(currantToString(value).get());
}

function currantWarn(value) {
    console.warn(currantToString(value).get());
}

function currantPanic(value) {
    throw new Error(currantToString(value).get());
}