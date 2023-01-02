
const CURRANT_STD_OPTIONS = `

    Opt: type = $(val: ptr) {

        getType: fun = () -> type {
            -> #*val;
        };

        isSome: fun = () -> bool {
            -> getType() != none;
        };

        isNone: fun = () -> bool {
            -> getType() == none;
        };

        unwrap: fun = () -> #*val {
            if(isNone(), { panic("Unwrapped a None-Option"); });
            -> *val;
        };

        expect: fun = (message: str) -> #*val {
            if(isNone(), { panic(message); });
            -> *val;
        };

    };

    OptSome: fun = (val: ?) -> Opt {
        -> Opt(&val);
    };

    OptNone: fun = () -> Opt {
        nothing: none = {}();
        -> Opt(&nothing);
    };

`;