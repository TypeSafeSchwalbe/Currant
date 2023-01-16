
const CURRANT_STD_MACROS = `

    #start-macro \\|(.+?)\\|
    () -> #macro_operation_result {
        macro_operation_result: ? = {0};
        -> macro_operation_result;
    }
    #end-macro

    #start-macro \\^
    <-
    #end-macro

`;