
const CURRANT_STD_MATH = `

    len: fun = f@currantLen;

    MathFunctionsType: type = $() {

        E: f64 = 2.718281828459045f64;
        PI: f64 = 3.141592653589793f64;

        abs: fun = (x: ?) -> #x {
            if(x < numType~0u8, <- {
                -> numType~0u8 - x;
            });
            -> x;
        };

        min: fun = (a: ?, b: #a) -> #a {
            if(a < b, <- { -> a; });
            -> b;
        };

        max: fun = (a: ?, b: #a) -> #a {
            if(a > b, <- { -> a; });
            -> b;
        };

        powJsImpl: fun = f@currantPow;
        pow: fun = (x: ?, n: #x) -> #x {
            -> powJsImpl(#x, x, n);
        };

        sqrtJsImpl: fun = f@currantSqrt;
        sqrt: fun = (x: ?) -> #x {
            -> sqrtJsImpl(#x, x);
        };

        randomJsImpl: fun = f@currantRandom;
        random: fun = () -> f64 {
            -> randomJsImpl();
        };

    };
    Math: MathFunctionsType = MathFunctionsType();

`;

function currantLen(value) {
    if(typeof value.length === "undefined")
        throw new Error("parameter at index 0 is not an array or string");
    return currantCreateU64(value.length);
}

function currantPow(numType, x, n) {
    if(typeof x !== "number" && typeof x !== "bigint")
        throw new Error("parameter at index 0 is not a number");
    if(typeof n !== "number" && typeof n !== "bigint")
        throw new Error("parameter at index 1 is not a number");
    return numType.fromValue(Math.pow(Number(x), Number(n)));
}

function currantSqrt(numType, x) {
    if(typeof x !== "number" && typeof x !== "bigint")
        throw new Error("parameter at index 0 must be a number");
    return numType.fromValue(Math.sqrt(Number(x)));
}

function currantRandom() {
    return currantCreateF64(Math.random());
}