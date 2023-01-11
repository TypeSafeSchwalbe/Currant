
const CURRANT_STD_TESTING = `
    assert: fun = (statement: bool) {
        if(!statement, {
            panic("assertion failed");
        });
    };
`;