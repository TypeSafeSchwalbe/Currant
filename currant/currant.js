
// the currant interpreter
class Currant {

    constructor() {
        this.preprocessor = new CurrantPreprocessor();
        this.lexer = new CurrantLexer();
        this.lastBlockNode = null;
        this.currentFile = null;
        this.currentLine = 0;
        this.scriptTagName = "currant-script";
        this.showInterpreterStackTrace = false;
        this.stack = new CurrantStack();
        this.loader = new CurrantScriptLoader();
        this._loadDefaults();
    }

    _loadDefaults() {
        this.run(CURRANT_STD_TYPES, "std.types.crn");
        this.run(CURRANT_STD_CONSOLE, "std.console.crn");
        this.run(CURRANT_STD_CONDITIONS, "std.conditions.crn");
        this.run(CURRANT_STD_MATH, "std.math.crn");
        this.run(CURRANT_STD_LOOPS, "std.loops.crn");
        this.run(CURRANT_STD_TYPE_GETTERS, "std.type_getters.crn");
        this.run(CURRANT_STD_OPTIONS, "std.options.crn");
        this.run(CURRANT_STD_STRINGS, "std.strings.crn");
    }

    handleError(error) {
        console.error(this.stack.produceStackTrace(this.currentFile, this.currentLine, error.message));
        if(this.showInterpreterStackTrace) throw error;
    }

    run(scriptText, fileName) {
        this.stack.clear();
        try {
            if(typeof fileName === "undefined") fileName = null;
            let processedText = this.preprocessor.process(scriptText);
            let tokens = this.lexer.tokenize(processedText, fileName);
            let blockNode = new CurrantBlockNode().setRuntime(this).parse(tokens);
            blockNode.block = this.lastBlockNode;
            let executeResult = blockNode.execute();
            this.lastBlockNode = blockNode;
            if(executeResult === null) return executeResult;
            else return executeResult.getValue();
        } catch(error) {
            this.handleError(error);
        }
    }

}
const currant = new Currant();