import { Controller } from "@hotwired/stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

/**
 * @class Dashboard.FrameLoaderController
 * @classdesc TODO
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "frame", "loading" ]
  static values = {
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
  }

  /** 
   * Generate a Turbo frame and append the loader inside
   * 
   * @instance
   * @memberof Dashboard.FrameLoaderController
   **/
  storeUpdated(prop, storeId) {
    if (prop === "frameSelected") {
      let turboFrame = document.createElement("turbo-frame")
      turboFrame.id = this.store("frameSelected")
      turboFrame.src = "/dashboards/frames/web-vitals-data"
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
