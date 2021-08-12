import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"
import LineChart from "~/javascripts/dashboard/LineChart"

export default class extends Controller {
  connect() {
    subscription(this)
    this.subscribe()
  }

  isDataVizEmpty() {
    return document.querySelector("[data-viz='wrapper']").getElementsByTagName("svg").length === 0
  }

  lineChart() {
    if (this._lineChart === undefined) {
      this._lineChart = new LineChart(this.store(), 60, "[data-viz='wrapper']", "[data-viz='tooltip']")
    }
    return this._lineChart
  }

  storeUpdated(store, prop) {
    if (prop !== "selectedContextData") return
    this.isDataVizEmpty() ? this.lineChart().createDataVis() : this.lineChart().updateDataVis()
  }

  disconnect() {
    this.unsubscribe()
  }
}
