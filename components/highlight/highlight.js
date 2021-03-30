import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";
import ruby from "highlight.js/lib/languages/ruby";
import erb from "highlight.js/lib/languages/erb";
import javascript from "highlight.js/lib/languages/javascript";

hljs.registerLanguage("css", css);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("erb", erb);
hljs.registerLanguage("javascript", javascript);

document.addEventListener("turbo:load", function() {
  document.querySelectorAll("pre code").forEach(block => {
    hljs.highlightBlock(block);
  });
});
