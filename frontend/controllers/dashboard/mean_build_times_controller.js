import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

export default class extends Controller {
  connect() {
    subscription(this)
    this.subscribe()
  }

  storeUpdated(store) {
  }

  disconnect() {
    this.unsubscribe()
  }
}
