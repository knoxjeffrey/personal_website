import prism from "prismjs"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-json"
import "prismjs/components/prism-ruby"
import "prismjs/components/prism-yaml"

document.addEventListener("turbo:load", event => {
  prism.highlightAll()
})
