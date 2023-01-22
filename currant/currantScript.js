
// defines a currant script
class CurrantScript extends HTMLElement {

    constructor() {
        super();
        // on load
        addEventListener("load", (e) => {
            // hide the element
            this.style = "display: none; white-space: pre-wrap;";
            this.type = "text/plain";
            // load script sources and parse
            let type = "script";
            if(this.hasAttribute("type")) {
                type = this.getAttribute("type");
            }
            if(type !== "script" && type !== "test") {
                console.warn(`'${currant.scriptTagName}'-element specified invalid attribute 'type', must be "script" or "test", but is "${type}" instead. Defaulting to "script".`);
                type = "script";
            }
            if(this.hasAttribute("src"))
                currant.loader.queueFile(this.getAttribute("src"), type === "test");
            let tagCode = this.innerHTML
                .split("&amp;").join("&")
                .split("&lt;").join("<")
                .split("&gt;").join(">");
            if(tagCode.trim().length !== 0)
                currant.loader.queueText(tagCode, type === "test");
        });
    }

}

// register the tag
customElements.define(currant.scriptTagName, CurrantScript);