import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

const greenTarget = 40
const amberTarget = 50

export default class extends Controller {
  static targets = [ "production", "deployPreview", "cms" ]
  static values = { loading: String }
  static classes = [ "success", "warning", "error", "unavailable" ]

  connect() {
    subscription(this)
    this.subscribe()
  }

  updateMeanBuildTimesValue(target, text, context) {
    const meanBuildTime = this.calculateMeanBuildTime(context)
    target.innerHTML = `${text} ${meanBuildTime}`
    this.removeAlertColors(target)
    target.classList.add(this.alertColor(meanBuildTime))
  }

  loadingMeanBuildTimesValue(target, text) {
    target.innerHTML = `${text} ${this.loadingValue}`
    this.removeAlertColors(target)
  }

  calculateMeanBuildTime(context) {
    const totals = this.store().selectedNetlifyBuildData.reduce((acc , data) => {
      return data.context === context ? { count: acc.count + 1, time: acc.time + data.deploy_time } : acc
    }, { count: 0, time: 0 })
    return totals.time / totals.count || "N/A"
  }

  removeAlertColors(target) {
    target.classList.remove(this.successClass, this.warningClass, this.errorClass, this.unavailableClass)
  }

  alertColor(value) {
    if (value == "N/A") return this.unavailableClass
    if (value <= greenTarget) return this.successClass
    if (value <= amberTarget) return this.warningClass
    return this.errorClass
  }

  storeUpdated(store, prop) {
    if (store.fetchingNetlifyBuildData) {
      this.loadingMeanBuildTimesValue(this.productionTarget, "Production")
      this.loadingMeanBuildTimesValue(this.deployPreviewTarget, "Deploy preview")
      this.loadingMeanBuildTimesValue(this.cmsTarget, "CMS")
    }
    if (prop === "selectedNetlifyBuildData") {
      this.updateMeanBuildTimesValue(this.productionTarget, "Production ...", "production")
      this.updateMeanBuildTimesValue(this.deployPreviewTarget, "Deploy preview ...", "deploy-preview")
      this.updateMeanBuildTimesValue(this.cmsTarget, "CMS ...", "cms")
    }
  }

  disconnect() {
    this.unsubscribe()
  }
}
