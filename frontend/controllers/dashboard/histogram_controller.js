import { Controller } from "@hotwired/stimulus"
import { debounce } from "debounce"
import { subscription } from "~/javascripts/store/mixins/subscription"
import Histogram from "~/javascripts/dashboard/Histogram"

/**
 * @class Dashboard.HistogramController
 * @classdesc Stimulus controller that handles the histogram data visualisation.
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "loading", "visualisation" ]
  static values = {
    storeId: String,
    xAxis: String,
    yAxis: String
  }

  /** 
   * Subscribe to the store. Debounces the method for handling window resizes. Trigger `frameLoaded` to
   * start calculating the data within `SelectContextController`
   * 
   * @instance
   * @memberof Dashboard.HistogramController
   **/
  connect() {
    subscription(this)
    this.subscribe()
    this.editStore("frameLoaded", true)
    this.reconnect()
    this.resize = debounce(this.resize, 250).bind(this)
  }

  /** 
   * Handles a repeated Turbo visit to the dashboard page.
   * 
   * @instance
   * @memberof Dashboard.HistogramController
   **/
  reconnect() {
    if (this.store("selectedContextData")) {
      this.storeUpdated("selectedContextData", this.storeIdValue)
    }
  }

  /** 
   * Checks if the visualisation has been created yet
   * 
   * @instance
   * @memberof Dashboard.HistogramController
   **/
  isDataVizEmpty() {
    return document.querySelector("[data-histogram='wrapper']").getElementsByTagName("svg").length === 0
  }

  /** 
   * Creates a new instance of the Histogram class if not created, otherwise returns the instance of
   * the class
   * 
   * @instance
   * @memberof Dashboard.HistogramController
   **/
   histogram() {
    if (this._histogram === undefined) {
      this._windowWidth = window.innerWidth
      this._histogram = new Histogram(
        this.store("selectedContextData"),
        this.store("contextSelected"),
        "value",
        "[data-histogram='wrapper']"
      )
    }
    return this._histogram
  }

  /** 
   * Handles a resize of the screen by width but ignores height changes. Deletes the current
   * visualisation and the instance of the Histogram class so it will be created from scratch again.
   * 
   * @instance
   * @memberof Dashboard.HistogramController
   **/
  resize() {
    if (window.innerWidth === this._windowWidth) return

    this._windowWidth = window.innerWidth
    this._histogram = undefined
    const wrapper = document.querySelector("[data-histogram='wrapper']")
    wrapper.removeChild(wrapper.lastChild)
    this.histogram().createDataVis()
  }

  /** 
   * When the context is selected the data visualisation will either be creted or updated
   * 
   * @instance
   * @memberof Dashboard.HistogramController
   **/
  storeUpdated(prop, storeId) {
    if (this.store("fetchingDataVizData")) {
      this.loadingTarget.style.display = "block"
      this.visualisationTarget.style.display = "none"
    } else {
      if (prop !== "selectedContextData" && storeId === this.storeIdValue) return
      this.loadingTarget.style.display = "none"
      this.visualisationTarget.style.display = "block"
      if(this.isDataVizEmpty()) {
        this.histogram().createDataVis()
      } else {
        this.histogram().updateDataVis(this.store("selectedContextData"), this.store("contextSelected"))
      }
    }
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.HistogramController
   **/
  disconnect() {
    this.unsubscribe()
  }
}
