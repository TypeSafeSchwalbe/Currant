
class CurrantScriptLoader {

    constructor() {
        this.queue = [];
        this.running = false;
    }

    execute() {
        if(this.queue.length === 0 || this.running) return;
        this.running = true;
        currant.currentLine = 0;
        if(typeof this.queue[0].file !== "undefined") {
            currant.currentFile = this.queue[0].file;
            let fileRequest = fetch(this.queue[0].file).then(response => {
                if(response.status === 200) return response.text();
                else throw new Error(`[${response.status}] ${response.statusText}`);
            }).then(scriptText => {
                if(this.queue[0].test) currant.test(scriptText, this.queue[0].file);
                else currant.run(scriptText, this.queue[0].file);
            }).catch(error => {
                currant.handleError(error);
            }).finally(() => {
                this.finishExecute();
            });
        } else {
            currant.currentFile = "(html tag)";
            if(this.queue[0].test) currant.test(this.queue[0].text, "(html tag)");
            else currant.run(this.queue[0].text, "(html tag)");
            this.finishExecute();
        }
    }

    finishExecute() {
        this.running = false;
        this.queue.shift();
        this.execute();
    }

    queueFile(fileName, isTest) {
        this.queue.push({
            file: fileName,
            test: isTest,
        });
        this.execute();
    }

    queueText(src, isTest) {
        this.queue.push({
            text: src,
            test: isTest,
        });
        this.execute();
    }

}