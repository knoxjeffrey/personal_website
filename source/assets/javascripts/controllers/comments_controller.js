import { Controller } from "stimulus"

export default class extends Controller {
  static targets = [ "load", "commento" ]

  load() {
    this.loadTarget.style.display = "none"
    this.commentoTarget.classList.add("margin-top--xl")
    window.commento.main()
  }
}
