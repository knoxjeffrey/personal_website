import { Controller } from "stimulus"

export default class extends Controller {
  load() {
    this.element.style.display = "none"
    window.commento.main()
  }
}
