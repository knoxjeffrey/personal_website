import { Controller } from "@hotwired/stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

/**
 * @class Dashboard.FrameController
 * @classdesc Handles the click events on the data visualisation selectors
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "button" ]
  static values = {
    storeId: String
  }

  /** 
   * Subscribe to the store.
   * 
   * @instance
   * @memberof Dashboard.FrameController
   **/
  connect() {
    subscription(this)
    this.subscribe()
  }

  /** 
   * Event action to set the selected frame id in the store and add the appropriate active class
   * 
   * @instance
   * @memberof Dashboard.FrameController
   **/
  frameSelected(event) {
    this.editStore("frameSelected", event.params.id)
    this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("active"))
    event.target.classList.add("active")
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.FrameController
   **/
  disconnect() {
    this.unsubscribe()
  }
}
