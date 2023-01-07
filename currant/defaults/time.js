
const CURRANT_STD_TIME = `

    TimeFunctionsType: type = $() {

        millis: fun = f@currantTimeMillis;

        seconds: fun = f@currantTimeSeconds;

        sleepJsImpl: fun = f@currantSleep;
        sleepAsync: fun = (action: fun, timeout: u64) {
            sleepJsImpl(action, timeout);
        };

    };
    Time: TimeFunctionsType = TimeFunctionsType();

`;

function currantTimeMillis() {
    return currantCreateU64(Date.now());
}

function currantTimeSeconds() {
    return currantCreateU64(Math.floor(Date.now() / 1000));
}

function currantSleep(func, timeout) { // timeout is in millis
    setTimeout(func, Number(timeout));
}