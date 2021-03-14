import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";

hljs.registerLanguage("css", css);

document.addEventListener("turbo:load", function() {
  document.querySelectorAll("pre code").forEach(block => {
    hljs.highlightBlock(block);
  });
});
