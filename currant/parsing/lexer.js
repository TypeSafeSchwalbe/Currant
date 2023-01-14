
// define the currant lexer
class CurrantLexer {

    constructor() {
        // define the token presets
        this.presets = [
            this.createPreset("\\d+u8", "u8_literal"),
            this.createPreset("\\d+u16", "u16_literal"),
            this.createPreset("\\d+u32", "u32_literal"),
            this.createPreset("\\d+u64", "u64_literal"),
            this.createPreset("-?\\d+i8", "i8_literal"),
            this.createPreset("-?\\d+i16", "i16_literal"),
            this.createPreset("-?\\d+i32", "i32_literal"),
            this.createPreset("-?\\d+i64", "i64_literal"),
            this.createPreset("-?\\d+(\\.\\d+)?f32", "f32_literal"),
            this.createPreset("-?\\d+(\\.\\d+)?f64", "f64_literal"),
            this.createPreset("true", "boolean_literal"),
            this.createPreset("false", "boolean_literal"),
            this.createPreset("(?<!\\\\)\".*?(?<!\\\\)\"", "string_literal"),

            this.createPreset("\\/\\/", "line_comment"),
            this.createPreset("\\/\\*", "block_comment_start"),
            this.createPreset("\\*\\/", "block_comment_end"),
            this.createPreset(";", "line_terminator"),

            this.createPreset("\\(", "opening_parenthesis"),
            this.createPreset("\\)", "closing_parenthesis"),
            this.createPreset("\\[", "opening_bracket"),
            this.createPreset("\\]", "closing_bracket"),
            this.createPreset("{", "opening_brace"),
            this.createPreset("}", "closing_brace"),

            this.createPreset("=", "equals"),
            this.createPreset("\\+", "plus"),
            this.createPreset("-", "minus"),
            this.createPreset("\\*", "asterisk"),
            this.createPreset("\\/", "slash"),
            this.createPreset("%", "percent"),
            this.createPreset("&", "ampersand"),
            this.createPreset("!", "exclamation_mark"),
            this.createPreset("\\.", "dot"),
            this.createPreset("<", "smaller"),
            this.createPreset(">", "greater"),
            this.createPreset(",", "comma"),
            this.createPreset(":", "colon"),
            this.createPreset("@", "at"),
            this.createPreset("#", "hashtag"),
            this.createPreset("~", "tilde"),
            this.createPreset("\\?", "question_mark"),
            this.createPreset("\\$", "dollar"),

            this.createPreset("&&", "double_ampersand"),
            this.createPreset("\\|\\|", "double_pipe"),
            this.createPreset("==", "double_equals"),
            this.createPreset("!=", "not_equals"),
            this.createPreset("<=", "smaller_equals"),
            this.createPreset(">=", "greater_equals"),
            this.createPreset("<-", "arrow_left"),
            this.createPreset("->", "arrow_right"),
            this.createPreset("=>", "double_arrow_right"),

            this.createPreset("[\\w\\d_]+", "identifier")
        ];
    }

    createPreset(regex, name) {
        return {
            name,
            pattern: new RegExp(regex, "g")
        };
    }

    tokenize(scriptText, fileName) {
        let tokens = [];
        // detect *any* matching tokens
        for(const tokenPreset of this.presets) {
            let match;
            while((match = tokenPreset.pattern.exec(scriptText)) != null) {
                let token = {
                    index: match.index,
                    length: match[0].length,
                    name: tokenPreset.name,
                    text: match[0],
                    file: fileName
                };
                tokens.push(token);
            }
        }
        // sort the tokens
        tokens.sort((a, b) => a.index - b.index);
        // find overlaps between tokens
        let tokenPositions = [];
        let tokensActive = new Array(tokens.length);
        for(let i = 0; i < tokensActive.length; i++) tokensActive[i] = false;
        let overlaps = [];
        for(const token of tokens) {
            tokenPositions.push({
                index: token.index,
                active: true,
                token
            });
            tokenPositions.push({
                index: token.index + token.text.length,
                active: false,
                token
            });
        }
        tokenPositions.sort((a, b) => a.index - b.index);
        for(const tokenPosition of tokenPositions) {
            if(tokenPosition.active) {
                for(let tokenIndex = 0; tokenIndex < tokensActive.length; tokenIndex++) {
                    if(!tokensActive[tokenIndex]) continue;
                    overlaps.push([
                        tokenPosition.token,
                        tokens[tokenIndex]
                    ]);
                }
            }
            tokensActive[tokens.indexOf(tokenPosition.token)] = tokenPosition.active;
        }
        // between all overlaps, remove the ones that are smaller.
        // If they are of same size, remove the identifier.
        let removedTokens = [];
        for(const overlap of overlaps) {
            let removed = 0;
            if(removedTokens.includes(overlap[0])) continue;
            if(removedTokens.includes(overlap[1])) continue;
            if(overlap[0].length > overlap[1].length) removed = 1;
            else if(overlap[0].length < overlap[1].length) removed = 0;
            else if(overlap[0].name === "identifier") removed = 0;
            else if(overlap[1].name === "identifier") removed = 1;
            removedTokens.push(overlap[removed]);
        }
        for(const removedToken of removedTokens) {
            tokens.splice(tokens.indexOf(removedToken), 1);
        }
        // calculate the line of each token they are on, and remove index and length
        for(const token of tokens) {
            token.line = (scriptText.substring(0, token.index).match(/\n/g) || []).length + 1;
            delete token.index;
            delete token.length;
        }
        // return tokens
        return tokens;
    }

}
