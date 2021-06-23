import prism from "prismjs"
import "prismjs/components/prism-json"
import "prismjs/components/prism-ruby"

document.addEventListener("turbo:load", event => {
  prism.highlightAll()
})
