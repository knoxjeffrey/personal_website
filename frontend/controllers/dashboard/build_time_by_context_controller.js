import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

export default class extends Controller {
  static targets = [ "button", "production" ]

  connect() {
    subscription(this)
    this.subscribe()
    this.reconnect()
  }

  reconnect() {
    if (this.store().selectedNetlifyBuildData) {
      this.storeUpdated(this.store(), "selectedNetlifyBuildData")
    }
  }

  contextClicked(event) {    
    this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("selected"))
    event.target.classList.add("selected")
    const clickedContext = event.target.innerHTML
    this.editStore(
      "selectedContextData", this.selectContextData(clickedContext.toLowerCase().replace(" ", "-"))
    )
  }

  selectContextData(context) {
    return this.store().selectedNetlifyBuildData.filter(data => data.context === context)
  }

  storeUpdated(store, prop) {
    if (prop === "selectedNetlifyBuildData") {
      this.editStore("selectedContextData", this.selectContextData("production"))
      this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("selected"))
      this.buttonTargets[0].classList.add("selected")
    }
  }

  disconnect() {
    this.unsubscribe()
  }
}
