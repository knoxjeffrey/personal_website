import { Controller } from "@hotwired/stimulus"
import { debounce } from "debounce"
import { subscription } from "~/javascripts/store/mixins/subscription"
import { 
  targetLineValues, metricsInPercentile, axisMeasurementValues, percentage
} from "~/javascripts/dashboard/utils"
import SingleStackedBar from "~/javascripts/dashboard/SingleStackedBar"

/**
 * @class Dashboard.CoreVitalsSummaryController
 * @classdesc Stimulus controller that populates the mean core vitals score per vital type.
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [
    "lcp", "fid", "cls", "lcpLoader", "fidLoader", "clsLoader", "lcpVis", "fidVis", "clsVis"
  ]
  static values = {
    loading: String,
    storeId: String
  }
  static classes = [ "success", "warning", "error", "unavailable" ]

  /** 
   * Subscribe to the store.
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
  connect() {
    subscription(this)
    this.subscribe()
    this.reconnect()
    this.resize = debounce(this.resize, 250).bind(this)
  }

  /** 
   * Handles a repeated Turbo visit to the dashboard page.
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
  reconnect() {
    if (this.store("selectedDataVizData")) {
      this.storeUpdated("selectedDataVizData", this.storeIdValue)
    }
  }

  /** 
   * Handles a resize of the screen by width but ignores height changes. Deletes the current
   * visualisation and the instances of the stacked bar charts so they will be created from scratch again.
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
  resize() {
    if (window.innerWidth === this._windowWidth) return

    this._windowWidth = window.innerWidth
    this.destroySingleStackedBarDisplay();

    ["lcp", "fid", "cls"].forEach((context) => {
      console.log(this.contextData(context))
      this.updateContextDistribution(context, this.contextData(context))
    })
  }

  /** 
   * Shows the loading indicator for the mean core vital values and hides the stacked bar charts and
   * then destroys them so they can be created from scratch again when the new data is fetched from
   * the database.
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   loadSummary(target, text) {
    target.innerHTML = `${text} ${this.loadingValue}`
    this.removeAlertColors(target)

    this.singleStackedBarDisplay(false)
    this.destroySingleStackedBarDisplay()
  }

  /** 
   * Remove all of the color classes for the given target
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   removeAlertColors(target) {
    target.classList.remove(this.successClass, this.warningClass, this.errorClass, this.unavailableClass)
  }

  /** 
   * Changes the visibility of the stacked bar charts to either show the data vis or a loading indicator
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   singleStackedBarDisplay(hasData=true) {
    let dataVis = hasData ? "block" : "none"
    let loader = hasData ? "none" : "block"

    this.lcpVisTarget.style.display = dataVis
    this.fidVisTarget.style.display = dataVis
    this.clsVisTarget.style.display = dataVis
    this.lcpLoaderTarget.style.display = loader
    this.fidLoaderTarget.style.display = loader
    this.clsLoaderTarget.style.display = loader
  }

  /** 
   * Destroy stacked bar charts for each context and set them to undefined so they will be created from
   * scratch again
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   destroySingleStackedBarDisplay() {
    ["lcp", "fid", "cls"].forEach((context) => {
      this[`${context}VisTarget`].innerHTML = ""
      this[`_singleStackedBar_${context}`] = undefined
    })
  }

  /** 
   * Update the summary details for the mean values and stacked bar charts
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   updateSummary(target, text, context) {
    let contextData = this.contextData(context)

    this.updateMeanCoreVitalsValue(target, text, context, contextData)
    this.singleStackedBarDisplay()
    this.updateContextDistribution(context, contextData)
  }

  /** 
   * Get the data within the 75th percentile of all current results for the given context
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   contextData(context) {
    let data = this.store("selectedDataVizData").filter(data => data.metric === context)
    return metricsInPercentile(data, "data_float", 0.75)
  }

  /** 
   * Sets the text for the mean core vital for the given context and alters to color to indicate whether
   * it's good, needs improvement or poor.
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   updateMeanCoreVitalsValue(target, text, context, contextData) {
    const meanCoreVital = this.calculateMeanCoreVital(contextData)
    target.innerHTML = `${text} ${meanCoreVital} ${axisMeasurementValues(context)}`
    this.removeAlertColors(target)
    target.classList.add(this.alertColor(meanCoreVital, context))
  }

  /** 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   calculateMeanCoreVital(contextData) {
    const totals = contextData.reduce((acc , data) => {
      return { count: acc.count + 1, dataFloat: acc.dataFloat + data.data_float }
    }, { count: 0, dataFloat: 0 })
    return totals.count === 0 ? "N/A" :
                                Math.round(((totals.dataFloat / totals.count) + Number.EPSILON) * 10000) / 10000
  }

  /** 
   * Return the color depending on the time in relation to the KPI
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   alertColor(value, context) {
    const lineValues = targetLineValues(context)

    if (value == "N/A") return this.unavailableClass
    if (value <= lineValues.successLineValue) return this.successClass
    if (value <= lineValues.failLineValue) return this.warningClass
    return this.errorClass
  }

  /** 
   * Update the datavisualisation showing the split of good, okay, bad for the context
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   updateContextDistribution(context, contextData) {
    const grouped = this.coreVitalsGroupingCount(context, contextData)
    const data = this.dataForStackedBarChart(grouped)

    if(this.isDataVizEmpty(context)) {
      this.singleStackedBar(data, context).createDataVis()
    } else {
      this.singleStackedBar(data, context).updateDataVis(data, context)
    }
  }

  /** 
   * Get the total count of results plus the number of results within each context.
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   coreVitalsGroupingCount(context, contextData) {
    let result
    const target = targetLineValues(context)
    
    return contextData.reduce((acc , data) => {
      if (data.data_float <= target.successLineValue) {
        result = "good"
      } else if (data.data_float >= target.failLineValue) {
        result = "poor"
      } else {
        result = "needsImprovement"
      }
      let preUpdate = { 
        count: acc.count + 1, good: acc.good, needsImprovement: acc.needsImprovement, poor: acc.poor
      }
      preUpdate[result] += 1 
      return preUpdate
    }, { count: 0, good: 0, needsImprovement: 0, poor: 0 })
  }

  /** 
   * Get the percentage for each context. The cumulative value informs the data viz at which x axis value
   * the bar should start at. The bar class modifier is used in the CSS to change the bar colour
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
  dataForStackedBarChart(groupedCounts) {
    const good = percentage(groupedCounts.count, groupedCounts.good)
    const needsImprovement = percentage(groupedCounts.count, groupedCounts.needsImprovement)
    const poor = percentage(groupedCounts.count, groupedCounts.poor)
    return [
      { percentage: good, cumulative: 0, barClassModifier: "good" },
      { percentage: needsImprovement, cumulative: good, barClassModifier: "needsImprovement" },
      { percentage: poor, cumulative: (good + needsImprovement), barClassModifier: "poor" }
    ]
  }

  /** 
   * Checks if the visualisation has been created yet
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   isDataVizEmpty(context) {
    return document.querySelector(`[data-stacked-bar-${context}='wrapper']`).getElementsByTagName("svg").length === 0
  }

  /** 
   * Creates a new instance of the SingleStackedBar class if not created, otherwise returns the instance
   * of the class
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
   singleStackedBar(data, context) {
    if (this[`_singleStackedBar_${context}`] === undefined) {
      this._windowWidth = window.innerWidth
      this[`_singleStackedBar_${context}`] = new SingleStackedBar(
        data,
        this.store("contextSelected"),
        `[data-stacked-bar-${context}='wrapper']`
      )
    }
    return this[`_singleStackedBar_${context}`]
  }

  /** 
   * Triggered by the store whenever any store data changes.
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
  storeUpdated(prop, storeId) {
    if (this.store("fetchingDataVizData")) {
      this.loadSummary(this.lcpTarget, "LCP")
      this.loadSummary(this.fidTarget, "FID")
      this.loadSummary(this.clsTarget, "CLS")
    }
    if (prop === "selectedDataVizData" && storeId === this.storeIdValue) {
      this.updateSummary(this.lcpTarget, "LCP ...", "lcp")
      this.updateSummary(this.fidTarget, "FID ...", "fid")
      this.updateSummary(this.clsTarget, "CLS ...", "cls")
    }
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.MeanBuildTimesController
   **/
  disconnect() {
    this.unsubscribe()
  }
}
