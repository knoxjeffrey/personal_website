import { Controller } from "stimulus"
import { debounce } from "debounce"
import { subscription } from "~/javascripts/store/mixins/subscription"
import LineChart from "~/javascripts/dashboard/LineChart"

export default class extends Controller {
  connect() {
    subscription(this)
    this.subscribe()
    this.resize = debounce(this.resize, 250).bind(this)
  }

  isDataVizEmpty() {
    return document.querySelector("[data-viz='wrapper']").getElementsByTagName("svg").length === 0
  }

  lineChart() {
    if (this._lineChart === undefined) {
      this.editStore("windowWidth", window.innerWidth)
      this._lineChart = new LineChart(this.store(), 60, "[data-viz='wrapper']", "[data-viz='tooltip']")
    }
    return this._lineChart
  }

  resize() {
    if (window.innerWidth === this.store().windowWidth) return

    this.editStore("windowWidth", window.innerWidth)
    this._lineChart = undefined
    const wrapper = document.querySelector("[data-viz='wrapper']")
    wrapper.removeChild(wrapper.lastChild)
    this.lineChart().createDataVis()
  }

  storeUpdated(store, prop) {
    if (prop !== "selectedContextData") return
    this.isDataVizEmpty() ? this.lineChart().createDataVis() : this.lineChart().updateDataVis()
  }

  disconnect() {
    this.unsubscribe()
  }
}
