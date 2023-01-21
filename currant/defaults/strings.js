
const CURRANT_STD_STRINGS = `

    StringFunctionsType: type = $() {

        toString: fun = f@currantToString;

        containsNum: fun = f@currantContainsNum;

        parseNumJsImpl: fun = f@currantParseNum;
        parseNum: fun = (numType: type, string: str) -> Box {
            if(!containsNum(string), <- {
                -> NoneBox();
            });
            -> Box(parseNumJsImpl(numType, string));
        };

        subStrJsImpl: fun = f@currantSubstr;
        subStr: fun = (string: str, start: u64, end: u64) -> str {
            if(start > end, {
                panic("start index (" + toString(start) + ") is greater than end index (" + toString(end) + ")");
            });
            if(end > len(string), {
                panic("end index (" + toString(end) + ") is out of bounds for string (length " + toString(len(string)) + ")");
            });
            -> subStrJsImpl(string, start, end);
        };

        startsWithJsImpl: fun = f@currantStartsWith;
        startsWith: fun = (string: str, prefix: str) -> bool {
            -> startsWithJsImpl(string, prefix);
        };

        endsWithJsImpl: fun = f@currantEndsWith;
        endsWith: fun = (string: str, suffix: str) -> bool {
            -> endsWithJsImpl(string, suffix);
        };

        containsJsImpl: fun = f@currantStrContains;
        contains: fun = (string: str, part: str) -> bool {
            -> containsJsImpl(string, part);
        };

        indexOfJsImpl: fun = f@currantStrIndexOf;
        indexOf: fun = (string: str, part: str) -> Box {
            if(!contains(string, part), <- { -> NoneBox(); });
            -> Box(indexOfJsImpl(string, part));
        };

        lastIndexOfJsImpl: fun = f@currantStrLastIndexOf;
        lastIndexOf: fun = (string: str, part: str) -> Box {
            if(!contains(string, part), <- { -> NoneBox(); });
            -> Box(lastIndexOfJsImpl(string, part));
        };

        toUpperJsImpl: fun = f@currantToUpper;
        toUpper: fun = (string: str) -> str {
            -> toUpperJsImpl(string);
        };

        toLowerJsImpl: fun = f@currantToLower;
        toLower: fun = (string: str) -> str {
            -> toLowerJsImpl(string);
        };

        trimJsImpl: fun = f@currantTrim;
        trim: fun = (string: str) -> str {
            -> trimJsImpl(string);
        };

    };
    String: StringFunctionsType = StringFunctionsType();

`;

function currantToString(value) {
    if(value === null) return currantCreateStr("[none]");
    if(value instanceof CurrantPointer) return currantCreateStr("[pointer]");
    if(value instanceof CurrantType) return currantCreateStr("[type]");
    if(value instanceof Array) return currantArrayToString(value);
    if(typeof value === "function") return currantCreateStr("[function]");
    if(typeof value === "object") return currantCreateStr("[object]");
    return currantCreateStr(String(value));
}

function currantArrayToString(array) {
    let result = "[array: ";
    for(const element of array) {
        result += currantToString(element).get() + ", ";
    }
    return currantCreateStr(result.substring(0, result.length - 2) + "]");
}

function currantContainsNum(string) {
    if(string.length === 0) return currantCreateBool(false);
    return currantCreateBool(!isNaN(string));
}

function currantParseNum(numType, string) {
    return numType.fromValue(string);
}

function currantSubstr(string, start, end) {
    return currantCreateStr(string.substring(Number(start), Number(end)));
}

function currantStartsWith(string, prefix) {
    return currantCreateBool(string.startsWith(prefix));
}

function currantEndsWith(string, suffix) {
    return currantCreateBool(string.endsWith(suffix));
}

function currantStrContains(string, part) {
    return currantCreateBool(string.includes(part));
}

function currantStrIndexOf(string, part) {
    return currantCreateU64(string.indexOf(part));
}

function currantStrLastIndexOf(string, part) {
    return currantCreateU64(string.lastIndexOf(part));
}

function currantToUpper(string) {
    return currantCreateStr(string.toUpperCase());
}

function currantToLower(string) {
    return currantCreateStr(string.toLowerCase());
}

function currantTrim(string) {
    return currantCreateStr(string.trim());
}