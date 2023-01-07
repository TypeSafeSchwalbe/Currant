
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
        this.run(CURRANT_STD_BOXES, "std.boxes.crn");
        this.run(CURRANT_STD_STRINGS, "std.strings.crn");
        this.run(CURRANT_STD_TIME, "std.time.crn");
        this.run(CURRANT_STD_ARRAYS, "std.arrays.crn");
        this.run(CURRANT_STD_MAPS, "std.maps.crn");
    }

    handleError(error) {
        console.error(this.stack.produceStackTrace(this.currentFile, this.currentLine, error.message));
        if(this.showInterpreterStackTrace) throw error;
    }

    run(scriptText, fileName) {
        this.stack.clear();
        try {
            if(typeof fileName === "undefined") fileName = null;
            // preprocessor
            let processedText = this.preprocessor.process(scriptText);
            // lexer
            let tokens = this.lexer.tokenize(processedText, fileName);
            for(const token of tokens) token.currant = this; // attach runtime reference to tokens (for errors during parsing)
            // parsing
            let blockNode = new CurrantBlockNode().setRuntime(this).parse(tokens);
            blockNode.block = this.lastBlockNode;
            // execution
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