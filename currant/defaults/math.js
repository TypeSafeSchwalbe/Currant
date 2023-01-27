
const CURRANT_STD_MATH = `

    len: fun = f@currantLen;

    MathFunctionsType: type = $() {

        E: f64 = 2.718281828459045f64;
        PI: f64 = 3.141592653589793f64;

        INT_8_MIN: i8 = -128i8;
        INT_8_MAX: i8 = 127i8;
        INT_16_MIN: i16 = -32768i16;
        INT_16_MAX: i16 = 32767i16;
        INT_32_MIN: i32 = -2147483648i32;
        INT_32_MAX: i32 = 2147483647i32;
        INT_64_MIN: i64 = -9223372036854775808i64;
        INT_64_MAX: i64 = 9223372036854775807i64;

        UINT_8_MIN: u8 = 0u8;
        UINT_8_MAX: u8 = 255u8;
        UINT_16_MIN: u16 = 0u16;
        UINT_16_MAX: u16 = 65535u16;
        UINT_32_MIN: u32 = 0u32;
        UINT_32_MAX: u32 = 4294967295u32;
        UINT_64_MIN: u64 = 0u64;
        UINT_64_MAX: u64 = 18446744073709551615u64;

        F32_INF: f32 = 1f32 / 0f32;
        F32_NEG_INF: f32 = 0f32 - 1f32 / 0f32;
        F64_INF: f64 = 1f64 / 0f64;
        F64_NEG_INF: f64 = 0f64 - 1f64 / 0f64;

        F32_NaN: f32 = f@currantGetNaNF32();
        F64_NaN: f64 = f@currantGetNaNF64();

        NUM_TYPES: arr = [type: f32, f64, i8, i16, i32, i64, u8, u16, u32, u64];

        isNum: fun = (x: ?) -> bool {
            if(#x == f32, <- { -> true });
            if(#x == f64, <- { -> true });
            if(#x == i8, <- { -> true });
            if(#x == i16, <- { -> true });
            if(#x == i32, <- { -> true });
            if(#x == i64, <- { -> true });
            if(#x == u8, <- { -> true });
            if(#x == u16, <- { -> true });
            if(#x == u32, <- { -> true });
            if(#x == u64, <- { -> true });
            -> false;
        };

        isNaNJsImpl: fun = f@currantIsNaN;
        isNaN: fun = (x: ? => #x == f32 || #x == f64) -> bool {
            -> isNaNJsImpl(x);
        };

        abs: fun = (x: ? => isNum(x)) -> #x {
            if(x < #x~0u8, <- {
                -> #x~0u8 - x;
            });
            -> x;
        };

        min: fun = (a: ? => isNum(a), b: #a) -> #a {
            if(a < b, <- { -> a; });
            -> b;
        };

        max: fun = (a: ? => isNum(a), b: #a) -> #a {
            if(a > b, <- { -> a; });
            -> b;
        };

        powJsImpl: fun = f@currantPow;
        pow: fun = (x: ? => isNum(x), n: #x) -> #x {
            -> powJsImpl(#x, x, n);
        };

        sqrtJsImpl: fun = f@currantSqrt;
        sqrt: fun = (x: ? => isNum(x)) -> #x {
            -> sqrtJsImpl(#x, x);
        };

        randomJsImpl: fun = f@currantRandom;
        random: fun = () -> f64 {
            -> randomJsImpl();
        };

        roundJsImpl: fun = f@currantRound;
        round: fun = (x: ? => isNum(x)) -> #x {
            -> roundJsImpl(#x, x);
        };

        cbrtJsImpl: fun = f@currantCbrt;
        cbrt: fun = (x: ? => isNum(x)) -> #x {
            -> cbrtJsImpl(#x, x);
        };

        ceilJsImpl: fun = f@currantCeil;
        ceil: fun = (x: ? => isNum(x)) -> #x {
            -> ceilJsImpl(#x, x);
        };

        floorJsImpl: fun = f@currantFloor;
        floor: fun = (x: ? => isNum(x)) -> #x {
            -> floorJsImpl(#x, x);
        };

        logJsImpl: fun = f@currantMathLog;
        log: fun = (x: ? => isNum(x)) -> #x {
            -> logJsImpl(#x, x);
        };

        log10JsImpl: fun = f@currantLog10;
        log10: fun = (x: ? => isNum(x)) -> #x {
            -> log10JsImpl(#x, x);
        };

        log1pJsImpl: fun = f@currantLog1p;
        log1p: fun = (x: ? => isNum(x)) -> #x {
            -> log1pJsImpl(#x, x);
        };

        expJsImpl: fun = f@currantExp;
        exp: fun = (x: ? => isNum(x)) -> #x {
            -> expJsImpl(#x, x);
        };

        expm1JsImpl: fun = f@currantExpm1;
        expm1: fun = (x: ? => isNum(x)) -> #x {
            -> expm1JsImpl(#x, x);
        };

        sinJsImpl: fun = f@currantSin;
        sin: fun = (x: ? => isNum(x)) -> #x {
            -> sinJsImpl(#x, x);
        };

        cosJsImpl: fun = f@currantCos;
        cos: fun = (x: ? => isNum(x)) -> #x {
            -> cosJsImpl(#x, x);
        };

        tanJsImpl: fun = f@currantTan;
        tan: fun = (x: ? => isNum(x)) -> #x {
            -> tanJsImpl(#x, x);
        };

        asinJsImpl: fun = f@currantAsin;
        asin: fun = (x: ? => isNum(x)) -> #x {
            -> asinJsImpl(#x, x);
        };

        acosJsImpl: fun = f@currantAcos;
        acos: fun = (x: ? => isNum(x)) -> #x {
            -> acosJsImpl(#x, x);
        };

        atanJsImpl: fun = f@currantAtan;
        atan: fun = (x: ? => isNum(x)) -> #x {
            -> atanJsImpl(#x, x);
        };

        sinhJsImpl: fun = f@currantSinh;
        sinh: fun = (x: ? => isNum(x)) -> #x {
            -> sinhJsImpl(#x, x);
        };

        coshJsImpl: fun = f@currantCosh;
        cosh: fun = (x: ? => isNum(x)) -> #x {
            -> coshJsImpl(#x, x);
        };

        tanhJsImpl: fun = f@currantTanh;
        tanh: fun = (x: ? => isNum(x)) -> #x {
            -> tanhJsImpl(#x, x);
        };

        toRadians: fun = (x: ? => isNum(x)) -> #x {
            -> #x~(f64~x * Math.PI / 180f64);
        };
        radians: fun = toRadians;
        rad: fun = toRadians;

        toDegrees: fun = (x: ? => isNum(x)) -> #x {
            -> #x~(f64~x * 180f64 / Math.PI);
        };
        degrees: fun = toDegrees;
        deg: fun = toDegrees;

    };
    Math: MathFunctionsType = MathFunctionsType();

`;

function currantGetNaNF32() {
    return currantCreateF32(NaN);
}

function currantGetNaNF64() {
    return currantCreateF64(NaN);
}

function currantIsNaN(x) {
    return currantCreateBool(isNaN(x));
}

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