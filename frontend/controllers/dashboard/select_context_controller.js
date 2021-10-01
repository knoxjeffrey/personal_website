import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

/**
 * @class Dashboard.SelectContextController
 * @classdesc Stimulus controller that handles the buttons for the various contexts.
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "button" ]
  static values = {
    contextKey: String,
    defaultContext: String,
    storeId: String,
    xAxis: String,
    yAxis: String
  }

  /** 
   * Subscribe to the store.
   * 
   * @instance
   * @memberof Dashboard.SelectContextController
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
   * @memberof Dashboard.SelectContextController
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
   * @memberof Dashboard.SelectContextController
   **/
  contextClicked(event) {    
    this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("selected"))
    event.target.classList.add("selected")
    const buttonText = event.target.innerHTML
    this.editStore("contextSelected", this.contextSelected(buttonText))
    this.editStore("selectedContextData", this.selectContextData(this.contextSelected(buttonText)))
  }

  /** 
   * Get the data for the selected context. Also set the value to be used on the x axis.
   * If there is no data for the context then return a dummy object in an array.
   * 
   * @instance
   * @memberof Dashboard.SelectContextController
   **/
  selectContextData(context) {
    const contextData =  this.store("selectedDataVizData").filter(data => data[this.contextKeyValue] === context)

    if(this.storeIdValue === "builds_") {
      if(contextData.length === 0) return [{ [this.yAxisValue]: 0, [this.xAxisValue]: 0 }]
      return contextData.map((data, index) => Object.assign(data, { [this.xAxisValue]: index + 1 }))
    } else {
      if(contextData.length === 0) return [{ [this.yAxisValue]: 0, [this.xAxisValue]: 0 }]
      return contextData.map((data) => Object.assign(data, { [this.xAxisValue]: new Date(data.time_stamp).getDate() }))
    }
  }

  /** 
   * Use the button text to set the context.
   * 
   * @instance
   * @memberof Dashboard.SelectContextController
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
   * @memberof Dashboard.SelectContextController
   **/
  storeUpdated(prop, storeId) {
    if (prop === "selectedDataVizData" && storeId === this.storeIdValue) {
      this.editStore("contextSelected", this.contextSelected(this.defaultContextValue))
      this.editStore("selectedContextData", this.selectContextData(this.defaultContextValue))
      this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("selected"))
      this.buttonTargets[0].classList.add("selected")
    }
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.SelectContextController
   **/
  disconnect() {
    this.unsubscribe()
  }
}
