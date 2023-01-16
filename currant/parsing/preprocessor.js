
// define the currant preprocessor
// removes comments, replaces definitions
class CurrantPreprocessor {

    constructor() {
        this.macros = [];
    }

    createMacroObject(regex, replacement) {
        return {
            regex,
            replacement
        };
    }

    process(scriptText) {
        // read macros written in the script
        let macroStart = "#start-macro";
        let macroEnd = "#end-macro";
        let scriptLines = scriptText.split("\n");
        let currentMacroRegex = null;
        let currentMacroReplacement = "";
        for(const scriptLineRaw of scriptLines) {
            let scriptLine = scriptLineRaw.trim();
            if(currentMacroRegex === null) {
                if(scriptLine.startsWith(macroStart))
                    currentMacroRegex = new RegExp(scriptLine.substring(macroStart.length + 1), "gm")
                continue;
            }
            if(scriptLine.startsWith(macroEnd)) {
                this.macros.push(this.createMacroObject(currentMacroRegex, currentMacroReplacement.substring(0, currentMacroReplacement.length - 1)));
                currentMacroRegex = null;
                currentMacroReplacement = "";
                continue;
            }
            currentMacroReplacement += scriptLineRaw + "\n";
        }
        // remove macro definitions and line comments
        let result = "";
        let inMacro = false;
        for(const scriptLineRaw of scriptLines) {
            let scriptLine = scriptLineRaw.trim();
            if(scriptLine.startsWith(macroStart))
                inMacro = true;
            if(inMacro)
                result += "\n";
            if(!inMacro)
                result += scriptLineRaw + "\n";
            if(scriptLine.startsWith(macroEnd))
                inMacro = false;
        }
        result = result
                .split(/\/\/.*$/gm) // line comments
                .join("");
        // replace block comments, but do not remove line separators
        let blockCommentRegex = /\/\*((?!\*\/).)*\*\//ms;
        while(true) {
            let blockCommentMatch = blockCommentRegex.exec(result);
            if(blockCommentMatch == null) break;
            let textBeforeMatch = result.substring(0, blockCommentMatch.index);
            let textAfterMatch = result.substring(blockCommentMatch.index + blockCommentMatch[0].length);
            let matchReplacement = "";
            for(let i = 0; i < (blockCommentMatch[0].match(/\n/g) || []).length; i++) {
                matchReplacement += "\n";
            }
            result = textBeforeMatch + matchReplacement + textAfterMatch;
        }
        // replace definitions
        for(const macro of this.macros) {
            // get matches and their groups
            while(true) {
                let match = macro.regex.exec(result);
                if(match === null) break;
                let replacement = macro.replacement.slice(0, macro.replacement.length);
                let matchRefRegex = new RegExp("{\\d+}");
                while(true) {
                    let matchRefMatch = matchRefRegex.exec(replacement);
                    if(matchRefMatch === null) break;
                    replacement = replacement.slice(0, matchRefMatch.index)
                        + match[Number(matchRefMatch[0].slice(1, 2)) + 1]
                        + replacement.slice(matchRefMatch.index + matchRefMatch[0].length, replacement.length);
                }
                let replacementLines = replacement.split("\n");
                for(let replacementLineIndex = 0; replacementLineIndex < replacementLines.length; replacementLineIndex++) {
                    replacementLines[replacementLineIndex] = replacementLines[replacementLineIndex].trim();
                }
                replacement = replacementLines.join(" ");
                result = result.slice(0, match.index)
                    + replacement
                    + result.slice(match.index + match[0].length, result.length);
            }
        }
        return result;
    }

}
