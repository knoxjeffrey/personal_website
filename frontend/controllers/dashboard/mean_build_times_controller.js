import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

function targetLineValues(context) {
  if (context === "production") return { successLineValue: 40, failLineValue: 50 }
  if (context === "deploy-preview") return { successLineValue: 45, failLineValue: 55 }
  if (context === "cms") return { successLineValue: 35, failLineValue: 45 }
}

export default class extends Controller {
  static targets = [ "production", "deployPreview", "cms" ]
  static values = { loading: String }
  static classes = [ "success", "warning", "error", "unavailable" ]

  connect() {
    subscription(this)
    this.subscribe()

    this.reconnect()
  }

  reconnect() {
    if (this.store().selectedNetlifyBuildData) {
      this.storeUpdated(this.store(), "selectedNetlifyBuildData")
    }
  }

  updateMeanBuildTimesValue(target, text, context) {
    const meanBuildTime = this.calculateMeanBuildTime(context)
    target.innerHTML = `${text} ${meanBuildTime}`
    this.removeAlertColors(target)
    target.classList.add(this.alertColor(meanBuildTime, context))
  }

  loadingMeanBuildTimesValue(target, text) {
    target.innerHTML = `${text} ${this.loadingValue}`
    this.removeAlertColors(target)
  }

  calculateMeanBuildTime(context) {
    const totals = this.store().selectedNetlifyBuildData.reduce((acc , data) => {
      return data.context === context ? { count: acc.count + 1, time: acc.time + data.deploy_time } : acc
    }, { count: 0, time: 0 })
    return Math.round((totals.time / totals.count) * 100) / 100 || "N/A"
  }

  removeAlertColors(target) {
    target.classList.remove(this.successClass, this.warningClass, this.errorClass, this.unavailableClass)
  }

  alertColor(value, context) {
    const lineValues = targetLineValues(context)

    if (value == "N/A") return this.unavailableClass
    if (value <= lineValues.successLineValue) return this.successClass
    if (value <= lineValues.failLineValue) return this.warningClass
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
