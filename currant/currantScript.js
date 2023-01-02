
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
            if(this.hasAttribute("src")) {
                currant.loader.queueFile(this.getAttribute("src"));
            } else {
                console.warn(`'${currant.scriptTagName}'-element did not specify attribute 'src'.`);
            }
        });
    }

}

// register the tag
customElements.define(currant.scriptTagName, CurrantScript);