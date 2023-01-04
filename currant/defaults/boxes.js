
const CURRANT_STD_BOXES = `

    Box: type = $(val: ?) {

        getType: fun = () -> type {
            -> #val;
        };

        isSome: fun = () -> bool {
            -> getType() != none;
        };

        isNone: fun = () -> bool {
            -> getType() == none;
        };

        unwrap: fun = () -> #val {
            if(isNone(), { panic("Unwrapped a None-Box"); });
            -> val;
        };

        expect: fun = (message: str) -> #val {
            if(isNone(), { panic(message); });
            -> val;
        };

    };

    NoneBox: fun = () -> Box {
        -> Box({}());
    };

`;