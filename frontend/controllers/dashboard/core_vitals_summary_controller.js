import { Controller } from "@hotwired/stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"
import { 
  targetLineValues, metricsInPercentile, axisMeasurementValues, percentage
} from "~/javascripts/dashboard/utils"

/**
 * @class Dashboard.CoreVitalsSummaryController
 * @classdesc Stimulus controller that populates the mean core vitals score per vital type.
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "lcp", "fid", "cls" ]
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
   * Update the summary details for the mean values and mini stack bar charts
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
  updateSummary(target, text, context) {
    let contextData =  this.store("selectedDataVizData").filter(data => data.metric === context)
    contextData = metricsInPercentile(contextData, "data_float", 0.75)

    this.updateMeanCoreVitalsValue(target, text, context, contextData)
    this.updateContextDistribution(context, contextData)
    console.log(this.updateContextDistribution(context, contextData))
  }

  /** 
   * Sets the text for the mean build time and changes the color to match the KPI
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
   * Update the datavisualisation showing the split of good, okay, bad for the context
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
  updateContextDistribution(context, contextData) {
    let result
    const target = targetLineValues(context)
    const grouped = contextData.reduce((acc , data) => {
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
    return { 
      good: percentage(grouped.count, grouped.good),
      needsImprovement: percentage(grouped.count, grouped.needsImprovement),
      poor: percentage(grouped.count, grouped.poor)
    }
  }



  /** 
   * Sets the text whilst waiting for the mean build time
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
  loadingMeanCoreVitalValue(target, text) {
    target.innerHTML = `${text} ${this.loadingValue}`
    this.removeAlertColors(target)
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
   * Remove all of the color classes for the mean build time
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
  removeAlertColors(target) {
    target.classList.remove(this.successClass, this.warningClass, this.errorClass, this.unavailableClass)
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
   * Triggered by the store whenever any store data changes. Controls whether the mean build time should
   * be populated or display the loading indicator
   * 
   * @instance
   * @memberof Dashboard.CoreVitalsSummaryController
   **/
  storeUpdated(prop, storeId) {
    if (this.store("fetchingDataVizData")) {
      this.loadingMeanCoreVitalValue(this.lcpTarget, "LCP")
      this.loadingMeanCoreVitalValue(this.fidTarget, "FID")
      this.loadingMeanCoreVitalValue(this.clsTarget, "CLS")
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
