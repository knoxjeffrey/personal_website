import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";
import erb from "highlight.js/lib/languages/erb";

hljs.registerLanguage("css", css);
hljs.registerLanguage("erb", erb);

document.addEventListener("turbo:load", function() {
  document.querySelectorAll("pre code").forEach(block => {
    hljs.highlightBlock(block);
  });
});
