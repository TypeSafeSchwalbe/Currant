
function runInput() {
    let input = document.getElementById("code-input");
    let output = document.getElementById("code-output");
    output.innerHTML = `<span class="code-source">${input.value}</span>` + "\n" + output.innerHTML;
    currant.run(input.value, "user-input.crn");
    input.value = "";
}

let oldConsoleLog = console.log;
let oldConsoleWarn = console.warn;
let oldConsoleError = console.error;

window.onload = function() {
    console.log = function(message) {
        let output = document.getElementById("code-output");
        output.innerHTML = message + "\n" + output.innerHTML;
        oldConsoleLog(message);
    }

    console.warn = function(message) {
        let output = document.getElementById("code-output");
        output.innerHTML = "/!\\ " + message + "\n" + output.innerHTML;
        oldConsoleWarn(message);
    }

    console.error = function(message) {
        let output = document.getElementById("code-output");
        output.innerHTML = `<span class="code-error">${"/!\\ " + message}</span>` + "\n" + output.innerHTML;
        oldConsoleError(message);
    }
}