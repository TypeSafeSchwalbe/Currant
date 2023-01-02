
const CURRANT_STD_LOOPS = `
    lpa: type = u8;
    cont: lpa = 0u8;
    brk: lpa = 1u8;
    loop: fun = f@currantLoop;

    while: fun = (doExecute: fun, loopBody: fun) {
        loop(() -> lpa {
            if(!doExecute(), <- {
                -> brk;
            });
            -> loopBody();
        });
    };

    range: fun = (start: u64, end: u64) -> arr {
        rangeLength: u64 = Math.max(start, end) - Math.min(start, end);
        rangeArray: arr = [u64: rangeLength: 0u64];
        i: u64 = 0u64;
        while(() -> bool { -> i < rangeLength; }, () -> lpa {
            if(start < end, { rangeArray[i] = start + i; });
            if(start > end, { rangeArray[i] = start - i; });
            i = i + 1u64;
            -> cont;
        });
        -> rangeArray;
    };

    for: fun = (array: arr, loopBody: fun) {
        i: u64 = 0u64;
        while(() -> bool { -> i < len(array); }, () -> lpa {
            cAction: lpa = loopBody(array[i]);
            i = i + 1u64;
            -> cAction;
        });
    };
`;

function currantLoop(action) {
    if(typeof action !== "function")
        throw new Error(`given argument at index 0 is not a function`);
    while(true) {
        let actionValue = action();
        if(actionValue !== 0 && actionValue !== 1)
            throw new Error("loop body did not return continue ('cont') or break ('brk')");
        if(actionValue === 1) break;
    }
}