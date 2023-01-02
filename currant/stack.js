
class CurrantStack {

    constructor() {
        this.elements = [];
    }

    produceStackTrace(currentFile, currentLine, reason) {
        if(currentFile === null) currentFile = "(unknown)";
        if(currentLine === null) currentLine = "(unknown)";
        let output = `Script "${currentFile}" panicked on line ${currentLine}: ${reason}`;
        for(const element of this.elements.slice(0, this.elements.length).reverse()) {
            output += "\n" + `    called "${element.callRef}" - called from "${element.callFile}" on line ${element.callLine} - defined at "${element.srcFile}" on line ${element.srcLine}`;
        }
        return output;
    }

    push(callRef, callFile, callLine, srcFile, srcLine) {
        if(callFile === null) callFile = "(unknown)";
        if(callLine === null) callLine = "(unknown)";
        if(srcFile === null) srcFile = "(unknown)";
        if(srcLine === null) srcLine = "(unknown)";
        this.elements.push({
            callRef,
            callFile,
            callLine,
            srcFile,
            srcLine
        });
    }

    pop() {
        this.elements.pop();
    }

    clear() {
        this.elements = [];
    }

}