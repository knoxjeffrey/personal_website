import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

export default class extends Controller {
  static targets = [ "production", "deployPreview", "cms" ]
  static values = { loading: String }

  connect() {
    subscription(this)
    this.subscribe()
  }

  updateSuccessfulBuildsValue(target, text, context) {
    target.innerHTML = `${text} ${this.calculateNumberOfBuilds(context)}`
  }

  loadingSuccessfulBuildsValue(target, text) {
    target.innerHTML = `${text} ${this.loadingValue}`
  }

  calculateNumberOfBuilds(context) {
    return this.store().selectedNetlifyBuildData.reduce((acc , data) => {
      return data.context === context ? acc + 1 : acc
    }, 0)
  }

  storeUpdated(store, prop) {
    if (store.fetchingNetlifyBuildData) {
      this.loadingSuccessfulBuildsValue(this.productionTarget, "Production")
      this.loadingSuccessfulBuildsValue(this.deployPreviewTarget, "Deploy preview")
      this.loadingSuccessfulBuildsValue(this.cmsTarget, "CMS")
    }
    if (prop === "selectedNetlifyBuildData") {
      this.updateSuccessfulBuildsValue(this.productionTarget, "Production ...", "production")
      this.updateSuccessfulBuildsValue(this.deployPreviewTarget, "Deploy preview ...", "deploy-preview")
      this.updateSuccessfulBuildsValue(this.cmsTarget, "CMS ...", "cms")
    }
  }

  disconnect() {
    this.unsubscribe()
  }
}
