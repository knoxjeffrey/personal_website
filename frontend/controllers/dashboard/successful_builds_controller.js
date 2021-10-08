import { Controller } from "@hotwired/stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

/**
 * @class Dashboard.SuccessfulBuildsController
 * @classdesc Stimulus controller that populates the number of successful builds per build context.
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "production", "deployPreview", "cms" ]
  static values = {
    loading: String,
    storeId: String
  }

  /** 
   * Subscribe to the store.
   * 
   * @instance
   * @memberof Dashboard.SuccessfulBuildsController
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
   * @memberof Dashboard.SuccessfulBuildsController
   **/
  reconnect() {
    if (this.store("selectedDataVizData")) {
      this.storeUpdated("selectedDataVizData", this.storeIdValue)
    }
  }

  /** 
   * Sets the text for the number of builds
   * 
   * @instance
   * @memberof Dashboard.SuccessfulBuildsController
   **/
  updateSuccessfulBuildsValue(target, text, context) {
    target.innerHTML = `${text} ${this.calculateNumberOfBuilds(context)}`
  }

  /** 
   * Sets the text whilst waiting for the number of builds
   * 
   * @instance
   * @memberof Dashboard.SuccessfulBuildsController
   **/
  loadingSuccessfulBuildsValue(target, text) {
    target.innerHTML = `${text} ${this.loadingValue}`
  }

  /** 
   * @instance
   * @memberof Dashboard.SuccessfulBuildsController
   **/
  calculateNumberOfBuilds(context) {
    return this.store("selectedDataVizData").reduce((acc , data) => {
      return data.context === context ? acc + 1 : acc
    }, 0)
  }

  /** 
   * Triggered by the store whenever any store data changes. Controls whether the number of builds should
   * be populated or display the loading indicator
   * 
   * @instance
   * @memberof Dashboard.SuccessfulBuildsController
   **/
  storeUpdated(prop, storeId) {
    if (this.store("fetchingDataVizData")) {
      this.loadingSuccessfulBuildsValue(this.productionTarget, "Production")
      this.loadingSuccessfulBuildsValue(this.deployPreviewTarget, "Deploy preview")
      this.loadingSuccessfulBuildsValue(this.cmsTarget, "CMS")
    }
    if (prop === "selectedDataVizData" && storeId === this.storeIdValue) {
      this.updateSuccessfulBuildsValue(this.productionTarget, "Production ...", "production")
      this.updateSuccessfulBuildsValue(this.deployPreviewTarget, "Deploy preview ...", "deploy-preview")
      this.updateSuccessfulBuildsValue(this.cmsTarget, "CMS ...", "cms")
    }
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.SuccessfulBuildsController
   **/
  disconnect() {
    this.unsubscribe()
  }
}
