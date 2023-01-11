
// defines a currant script
class CurrantScript extends HTMLElement {

    constructor() {
        super();
        // on load
        addEventListener("load", (e) => {
            // hide the element
            this.style.display = "none";
            this.type = "text/plain";
            // load script sources and parse
            if(!this.hasAttribute("src")) {
                console.warn(`'${currant.scriptTagName}'-element did not specify attribute 'src'.`);
                return;
            }
            let type = "script";
            if(this.hasAttribute("type")) {
                type = this.getAttribute("type");
            }
            if(type !== "script" && type !== "test") {
                console.warn(`'${currant.scriptTagName}'-element specified invalid attribute 'type', must be "script" or "test", but is "${type}" instead. Defaulting to "script".`);
                type = "script";
            }
            currant.loader.queueFile(this.getAttribute("src"), type === "test");
        });
    }

}

// register the tag
customElements.define(currant.scriptTagName, CurrantScript);