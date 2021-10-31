import { Controller } from "@hotwired/stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

/**
 * @class Dashboard.PagesController
 * @classdesc Stimulus controller that handles the pages breakdown
 * @extends Controller
 **/
export default class extends Controller {
  /** 
   * Subscribe to the store. Trigger `frameLoaded` to start calculating the data within
   * `SelectContextController`
   * 
   * @instance
   * @memberof Dashboard.PagesController
   **/
  connect() {
    subscription(this)
    this.subscribe()
    this.editStore("frameLoaded", true)
    this.reconnect()
  }

  /** 
   * Handles a repeated Turbo visit to the dashboard page.
   * 
   * @instance
   * @memberof Dashboard.PagesController
   **/
  reconnect() {
    if (this.store("selectedContextData")) {
      this.storeUpdated("selectedContextData", this.storeIdValue)
    }
  }

  /** 
   * 
   * 
   * @instance
   * @memberof Dashboard.PagesController
   **/
  storeUpdated(prop, storeId) {
    
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.PagesController
   **/
  disconnect() {
    this.unsubscribe()
  }
}
