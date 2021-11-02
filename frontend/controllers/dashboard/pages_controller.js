import { Controller } from "@hotwired/stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"
import { targetLineValues } from "~/javascripts/dashboard/utils"

/**
 * @class Dashboard.PagesController
 * @classdesc Stimulus controller that handles the pages breakdown
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "loading", "visualisation" ]
  static values = {
    storeId: String
  }
  static classes = [ "warning", "error" ]

  /** 
   * Subscribe to the store. Trigger `frameLoaded` to start calculating the data within
   * `SelectContextController`
   * 
   * @instance
   * @memberof Dashboard.PagesController
   **/
  connect() {
    subscription(this)
    this.subscribe()
    this.editStore("frameLoaded", true)
  }

  populatePageInformation() {
    if(this.store("selectedContextData").length) return this.failingPages()
    this.noFailingPages()
  }

  failingPages() {
    this.visualisationTarget.innerHTML = ""
    this.store("selectedContextData").forEach((page) => {
      const failValue = targetLineValues(this.store("contextSelected")).failLineValue
      const colorClass = page.value > failValue ? this.errorClass : this.warningClass

      let successMessage = document.createElement("div")
      successMessage.classList = `terminal-alert ${colorClass}`
      successMessage.innerHTML = `${page.path} ... ${page.value}`
      this.visualisationTarget.appendChild(successMessage)
    })
  }

  noFailingPages() {
    let successMessage = document.createElement("div")
    successMessage.classList = "terminal-alert terminal-alert-success"
    successMessage.innerHTML = "Congratulations, all pages pass Core Web Vitals!"

    this.visualisationTarget.innerHTML = ""
    this.visualisationTarget.appendChild(successMessage)
  }

  /** 
   * 
   * 
   * @instance
   * @memberof Dashboard.PagesController
   **/
  storeUpdated(prop, storeId) {
    if (this.store("fetchingDataVizData")) {
      this.loadingTarget.style.display = "block"
      this.visualisationTarget.style.display = "none"
    } else {
      if (prop !== "selectedContextData" && storeId === this.storeIdValue) return
      this.populatePageInformation()
      this.loadingTarget.style.display = "none"
      this.visualisationTarget.style.display = "block"
    }
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.PagesController
   **/
  disconnect() {
    this.unsubscribe()
  }
}
