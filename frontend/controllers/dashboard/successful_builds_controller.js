import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

export default class extends Controller {
  static targets = [ "production", "deployPreview", "cms" ]

  connect() {
    subscription(this)
    this.subscribe()
  }

  updateProductionValue() {
    this.productionTarget.innerHTML = `Production ... ${this.calculateNumberOfBuilds("production")}`
  }

  updateDeployPreviewValue() {
    this.deployPreviewTarget.innerHTML = `Depoly preview ... ${this.calculateNumberOfBuilds("deploy-preview")}`
  }

  updateCmsValue() {
    this.cmsTarget.innerHTML = `CMS ... ${this.calculateNumberOfBuilds("cms")}`
  }

  calculateNumberOfBuilds(context) {
    return this.store().selectedNetlifyBuildData.reduce((acc , data) => {
      return data.context === context ? acc + 1 : acc
    }, 0)
  }

  storeUpdated(store, prop) {
    if (prop === "selectedNetlifyBuildData") {
      this.updateProductionValue()
      this.updateDeployPreviewValue()
      this.updateCmsValue()
    }
  }

  disconnect() {
    this.unsubscribe()
  }
}
