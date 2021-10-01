import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"
import { targetLineValues } from "~/javascripts/dashboard/utils"

/**
 * @class Dashboard.MeanBuildTimesController
 * @classdesc Stimulus controller that populates the mean build time per build context.
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "production", "deployPreview", "cms" ]
  static values = {
    loading: String,
    storeId: String
  }
  static classes = [ "success", "warning", "error", "unavailable" ]

  /** 
   * Subscribe to the store.
   * 
   * @instance
   * @memberof Dashboard.MeanBuildTimesController
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
   * @memberof Dashboard.MeanBuildTimesController
   **/
  reconnect() {
    if (this.store("selectedDataVizData")) {
      this.storeUpdated(this.store(), "selectedDataVizData", this.storeIdValue)
    }
  }

  /** 
   * Sets the text for the mean build time and changes the color to match the KPI
   * 
   * @instance
   * @memberof Dashboard.MeanBuildTimesController
   **/
  updateMeanBuildTimesValue(target, text, context) {
    const meanBuildTime = this.calculateMeanBuildTime(context)
    target.innerHTML = `${text} ${meanBuildTime}`
    this.removeAlertColors(target)
    target.classList.add(this.alertColor(meanBuildTime, context))
  }

  /** 
   * Sets the text whilst waiting for the mean build time
   * 
   * @instance
   * @memberof Dashboard.MeanBuildTimesController
   **/
  loadingMeanBuildTimesValue(target, text) {
    target.innerHTML = `${text} ${this.loadingValue}`
    this.removeAlertColors(target)
  }

  /** 
   * @instance
   * @memberof Dashboard.MeanBuildTimesController
   **/
  calculateMeanBuildTime(context) {
    const totals = this.store("selectedDataVizData").reduce((acc , data) => {
      return data.context === context ? { count: acc.count + 1, time: acc.time + data.deploy_time } : acc
    }, { count: 0, time: 0 })
    return Math.round((totals.time / totals.count) * 100) / 100 || "N/A"
  }

  /** 
   * Remove all of the color classes for the mean build time
   * 
   * @instance
   * @memberof Dashboard.MeanBuildTimesController
   **/
  removeAlertColors(target) {
    target.classList.remove(this.successClass, this.warningClass, this.errorClass, this.unavailableClass)
  }

  /** 
   * Return the color depending on the time in relation to the KPI
   * 
   * @instance
   * @memberof Dashboard.MeanBuildTimesController
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
   * @memberof Dashboard.MeanBuildTimesController
   **/
  storeUpdated(prop, storeId) {
    if (this.store("fetchingDataVizData")) {
      this.loadingMeanBuildTimesValue(this.productionTarget, "Production")
      this.loadingMeanBuildTimesValue(this.deployPreviewTarget, "Deploy preview")
      this.loadingMeanBuildTimesValue(this.cmsTarget, "CMS")
    }
    if (prop === "selectedDataVizData" && storeId === this.storeIdValue) {
      this.updateMeanBuildTimesValue(this.productionTarget, "Production ...", "production")
      this.updateMeanBuildTimesValue(this.deployPreviewTarget, "Deploy preview ...", "deploy-preview")
      this.updateMeanBuildTimesValue(this.cmsTarget, "CMS ...", "cms")
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
