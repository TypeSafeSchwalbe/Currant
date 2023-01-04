
const CURRANT_STD_TIME = `

    TimeFunctionsType: type = $() {

        millis: fun = f@currantTimeMillis;

        seconds: fun = f@currantTimeSeconds;

        sleepJsImpl: fun = f@currantSleep;
        sleep: fun = (timeout: u64) {
            sleepJsImpl(timeout);
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

function currantSleep(timeout) { // timeout is in millis
    console.log("IMPLEMENT SLEEP (timeout=" + timeout + ")!");
}