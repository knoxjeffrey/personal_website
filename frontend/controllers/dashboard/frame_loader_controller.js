import { Controller } from "@hotwired/stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

/**
 * @class Dashboard.FrameLoaderController
 * @classdesc Requests the correct Turbo frame to load in the required data visualisation
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "frame", "loading" ]
  static values = {
    defaultFrame: String,
    path: String,
    storeId: String
  }

  /** 
   * Subscribe to the store.
   * 
   * @instance
   * @memberof Dashboard.FrameLoaderController
   **/
  connect() {
    this.clonedLoader = this.loadingTarget.cloneNode(true)
    subscription(this)
    this.subscribe()
    this.reconnect()
  }

  /** 
   * Handles a repeated Turbo visit to the dashboard page.
   * 
   * @instance
   * @memberof Dashboard.FrameLoaderController
   **/
   reconnect() {
    if (this.store("frameSelected")) {
      this.editStore("frameSelected", this.defaultFrameValue)
    }
  }

  /** 
   * Generate a Turbo frame to load the correct data visualisation and append the loader inside
   * 
   * @instance
   * @memberof Dashboard.FrameLoaderController
   **/
  storeUpdated(prop, storeId) {
    if (prop === "frameSelected") {
      let turboFrame = document.createElement("turbo-frame")
      turboFrame.id = this.store("frameSelected")
      turboFrame.src = this.pathValue
      turboFrame.appendChild(this.clonedLoader)

      this.frameTarget.innerHTML = ""
      this.frameTarget.appendChild(turboFrame)
    }
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.FrameLoaderController
   **/
  disconnect() {
    this.unsubscribe()
  }
}
