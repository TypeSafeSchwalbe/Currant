
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

        roundJsImpl: fun = f@currantRound;
        round: fun = (x: ?) -> #x {
            -> roundJsImpl(#x, x);
        };

        cbrtJsImpl: fun = f@currantCbrt;
        cbrt: fun = (x: ?) -> #x {
            -> cbrtJsImpl(#x, x);
        };

        ceilJsImpl: fun = f@currantCeil;
        ceil: fun = (x: ?) -> #x {
            -> ceilJsImpl(#x, x);
        };

        floorJsImpl: fun = f@currantFloor;
        floor: fun = (x: ?) -> #x {
            -> floorJsImpl(#x, x);
        };

        logJsImpl: fun = f@currantMathLog;
        log: fun = (x: ?) -> #x {
            -> logJsImpl(#x, x);
        };

        log10JsImpl: fun = f@currantLog10;
        log10: fun = (x: ?) -> #x {
            -> log10JsImpl(#x, x);
        };

        log1pJsImpl: fun = f@currantLog1p;
        log1p: fun = (x: ?) -> #x {
            -> log1pJsImpl(#x, x);
        };

        expJsImpl: fun = f@currantExp;
        exp: fun = (x: ?) -> #x {
            -> expJsImpl(#x, x);
        };

        expm1JsImpl: fun = f@currantExpm1;
        expm1: fun = (x: ?) -> #x {
            -> expm1JsImpl(#x, x);
        };

        sinJsImpl: fun = f@currantSin;
        sin: fun = (x: ?) -> #x {
            -> sinJsImpl(#x, x);
        };

        cosJsImpl: fun = f@currantCos;
        cos: fun = (x: ?) -> #x {
            -> cosJsImpl(#x, x);
        };

        tanJsImpl: fun = f@currantTan;
        tan: fun = (x: ?) -> #x {
            -> tanJsImpl(#x, x);
        };

        asinJsImpl: fun = f@currantAsin;
        asin: fun = (x: ?) -> #x {
            -> asinJsImpl(#x, x);
        };

        acosJsImpl: fun = f@currantAcos;
        acos: fun = (x: ?) -> #x {
            -> acosJsImpl(#x, x);
        };

        atanJsImpl: fun = f@currantAtan;
        atan: fun = (x: ?) -> #x {
            -> atanJsImpl(#x, x);
        };

        sinhJsImpl: fun = f@currantSinh;
        sinh: fun = (x: ?) -> #x {
            -> sinhJsImpl(#x, x);
        };

        coshJsImpl: fun = f@currantCosh;
        cosh: fun = (x: ?) -> #x {
            -> coshJsImpl(#x, x);
        };

        tanhJsImpl: fun = f@currantTanh;
        tanh: fun = (x: ?) -> #x {
            -> tanhJsImpl(#x, x);
        };

        toRadians: fun = (x: ?) -> #x {
            -> #x~(f64~x * Math.PI / 180f64);
        };
        radians: fun = toRadians;
        rad: fun = toRadians;

        toDegrees: fun = (x: ?) -> #x {
            -> #x~(f64~x * 180f64 / Math.PI);
        };
        degrees: fun = toDegrees;
        deg: fun = toDegrees;

    };
    Math: MathFunctionsType = MathFunctionsType();

`;

function currantLen(value) {
    if(typeof value.length === "undefined")
        throw new Error("parameter at index 0 is not an array or string");
    return currantCreateU64(value.length);
}

function currantMathFunNumCheck(values) {
    for(let i = 0; i < values.length; i++) {
        if(typeof values[i] !== "number" && typeof values[i] !== "bigint")
            throw new Error(`parameter at index ${i} is not a number`);
    }
}

function currantPow(numType, x, n) {
    currantMathFunNumCheck([x, n]);
    return numType.fromValue(Math.pow(Number(x), Number(n)));
}

function currantSqrt(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.sqrt(Number(x)));
}

function currantRandom() {
    return currantCreateF64(Math.random());
}

function currantRound(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.round(Number(x)));
}

function currantCbrt(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.cbrt(Number(x)));
}

function currantCeil(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.ceil(Number(x)));
}

function currantFloor(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.floor(Number(x)));
}

function currantMathLog(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.log(Number(x)));
}

function currantLog10(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.log10(Number(x)));
}

function currantLog1p(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.log1p(Number(x)));
}

function currantExp(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.exp(Number(x)));
}

function currantExpm1(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.expm1(Number(x)));
}

function currantSin(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.sin(Number(x)));
}

function currantCos(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.cos(Number(x)));
}

function currantTan(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.tan(Number(x)));
}

function currantAsin(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.asin(Number(x)));
}

function currantAcos(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.acos(Number(x)));
}

function currantAtan(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.atan(Number(x)));
}

function currantSinh(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.sinh(Number(x)));
}

function currantCosh(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.cosh(Number(x)));
}

function currantTanh(numType, x) {
    currantMathFunNumCheck([x]);
    return numType.fromValue(Math.tanh(Number(x)));
}