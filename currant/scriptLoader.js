
class CurrantScriptLoader {

    constructor() {
        this.queue = [];
        this.running = false;
    }

    execute() {
        if(this.queue.length === 0 || this.running) return;
        this.running = true;
        let source = this.queue[0].text;
        if(typeof this.queue[0].file !== "undefined") {
            let fileRequest = fetch(this.queue[0].file).then(response => {
                if(response.status === 200) return response.text();
                else throw new Error(`[${response.status}] ${response.statusText}`);
            }).then(scriptText => {
                currant.run(scriptText, this.queue[0].file);
            }).catch(error => {
                currant.handleError(error);
            }).finally(() => {
                this.finishExecute();
            });
        } else {
            currant.run(source, "(html currant-script element)");
            this.finishExecute();
        }
    }

    finishExecute() {
        this.running = false;
        this.queue.shift();
        this.execute();
    }

    queueFile(fileName) {
        this.queue.push({
            file: fileName
        });
        if(!this.running) this.execute();
    }

    queueText(source) {
        this.queue.push({
            text: source
        });
        if(!this.running) this.execute();
    }

}