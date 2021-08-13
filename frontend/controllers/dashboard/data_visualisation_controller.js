import { Controller } from "stimulus"
import { debounce } from "debounce"
import { subscription } from "~/javascripts/store/mixins/subscription"
import LineChart from "~/javascripts/dashboard/LineChart"

/**
 * @class Dashboard.DataVisualisationController
 * @classdesc Stimulus controller that handles the line chart data visualisation.
 * @extends Controller
 **/
export default class extends Controller {
  /** 
   * Subscribe to the store. Debounces the method for handling window resizes
   * 
   * @instance
   * @memberof Dashboard.DataVisualisationController
   **/
  connect() {
    subscription(this)
    this.subscribe()
    this.resize = debounce(this.resize, 250).bind(this)
  }

  /** 
   * Checks if the visualisation has been created yet
   * 
   * @instance
   * @memberof Dashboard.DataVisualisationController
   **/
  isDataVizEmpty() {
    return document.querySelector("[data-viz='wrapper']").getElementsByTagName("svg").length === 0
  }

  /** 
   * Creates a new instance of the LineChart class if not created, otherwise returns the instance of
   * the class
   * 
   * @instance
   * @memberof Dashboard.DataVisualisationController
   **/
  lineChart() {
    if (this._lineChart === undefined) {
      this._windowWidth = window.innerWidth
      this._lineChart = new LineChart(this.store(), 60, "[data-viz='wrapper']", "[data-viz='tooltip']")
    }
    return this._lineChart
  }

  /** 
   * Handles a resize of the screen by width but ignores height changes. Deletes the current
   * visualisation and the instance of the LineChart class so it will be created from scratch again.
   * 
   * @instance
   * @memberof Dashboard.DataVisualisationController
   **/
  resize() {
    if (window.innerWidth === this._windowWidth) return

    this._windowWidth = window.innerWidth
    this._lineChart = undefined
    const wrapper = document.querySelector("[data-viz='wrapper']")
    wrapper.removeChild(wrapper.lastChild)
    this.lineChart().createDataVis()
  }

  /** 
   * When the context is selected the data visualisation will either be creted or updated
   * 
   * @instance
   * @memberof Dashboard.DataVisualisationController
   **/
  storeUpdated(store, prop) {
    if (prop !== "selectedContextData") return
    this.isDataVizEmpty() ? this.lineChart().createDataVis() : this.lineChart().updateDataVis()
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.DataVisualisationController
   **/
  disconnect() {
    this.unsubscribe()
  }
}
