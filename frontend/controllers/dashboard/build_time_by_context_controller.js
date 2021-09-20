import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

/**
 * @class Dashboard.BuildTimeByContextController
 * @classdesc Stimulus controller that handles the buttons for the build context.
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "button", "production" ]
  static values = {
    storeId: String
  }

  /** 
   * Subscribe to the store.
   * 
   * @instance
   * @memberof Dashboard.BuildTimeByContextController
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
   * @memberof Dashboard.BuildTimeByContextController
   **/
  reconnect() {
    if (this.store("selectedDataVizData")) {
      this.storeUpdated(this.store(), "selectedDataVizData", this.storeIdValue)
    }
  }

  /** 
   * Sets the selected class on the clicked button and updates the store with the context clicked and
   * the data for the context
   * 
   * @instance
   * @memberof Dashboard.BuildTimeByContextController
   **/
  contextClicked(event) {    
    this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("selected"))
    event.target.classList.add("selected")
    const buttonText = event.target.innerHTML
    this.editStore("contextSelected", this.contextSelected(buttonText))
    this.editStore("selectedContextData", this.selectContextData(this.contextSelected(buttonText)))
  }

  /** 
   * Get the data for the selected context. Also set the build number to be used on the x axis.
   * If there are no builds for the context then return a dummy object in an array.
   * 
   * @instance
   * @memberof Dashboard.BuildTimeByContextController
   **/
  selectContextData(context) {
    const contextData =  this.store("selectedDataVizData").filter(data => data.context === context)

    if(contextData.length === 0) return [{ deploy_time: 0, build_number: 0 }]
    return contextData.map((data, index) => Object.assign(data, { build_number: index + 1 }))
  }

  /** 
   * Use the button text to set the context.
   * 
   * @instance
   * @memberof Dashboard.BuildTimeByContextController
   **/
  contextSelected(buttonText) {
    return buttonText.toLowerCase().replace(" ", "-")
  }

  /** 
   * Triggered by the store whenever any store data changes. In this case it checks for
   * selectedDataVizData to be set and then sets production as the initially selected context
   * button.
   * 
   * @instance
   * @memberof Dashboard.BuildTimeByContextController
   **/
  storeUpdated(store, prop, storeId) {
    if (prop === "selectedDataVizData" && storeId === this.storeIdValue) {
      this.editStore("contextSelected", this.contextSelected("production"))
      this.editStore("selectedContextData", this.selectContextData("production"))
      this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("selected"))
      this.buttonTargets[0].classList.add("selected")
    }
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.BuildTimeByContextController
   **/
  disconnect() {
    this.unsubscribe()
  }
}
