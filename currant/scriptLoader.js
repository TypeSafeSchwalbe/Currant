
class CurrantScriptLoader {

    constructor() {
        this.queue = [];
        this.running = false;
    }

    execute() {
        if(this.queue.length === 0 || this.running) return;
        this.running = true;
        currant.currentFile = this.queue[0];
        currant.currentLine = 0;
        let fileRequest = fetch(this.queue[0]).then(response => {
            if(response.status === 200) return response.text();
            else throw new Error(`[${response.status}] ${response.statusText}`);
        }).then(scriptText => {
            currant.run(scriptText, this.queue[0]);
        }).catch(error => {
            currant.handleError(error);
        }).finally(() => {
            this.finishExecute();
        });
    }

    finishExecute() {
        this.running = false;
        this.queue.shift();
        this.execute();
    }

    queueFile(fileName) {
        this.queue.push(fileName);
        if(!this.running) this.execute();
    }

}