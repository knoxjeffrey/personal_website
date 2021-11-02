import { Controller } from "@hotwired/stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"
import { targetLineValues, metricsInPercentile } from "~/javascripts/dashboard/utils"

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
    storeId: String
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
      this.storeUpdated("selectedDataVizData", this.storeIdValue)
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
    let selectedDataVizData = !this.store("selectedDataVizData") ? [] : this.store("selectedDataVizData") 
    let contextData =  selectedDataVizData.filter(data => data[this.contextKeyValue] === context)
    
    if(this.storeIdValue === "builds_") {
      if(contextData.length === 0) return [{ deploy_time: 0, build_number: 0 }]
      return contextData.map((data, index) => Object.assign(data, { build_number: index + 1 }))
    } else if (this.storeIdValue === "vitals_") {
      if (this.store("frameSelected") === undefined) this.editStore("frameSelected", "daily")

      contextData = metricsInPercentile(contextData, "data_float", 0.75)
      if (this.store("frameSelected") === "daily") {
        if(contextData.length === 0) return [{ value: 0, day: 0 }]

        const groupSumCount = contextData.reduce((acc , data) => {
          if (!acc.get(data.date)) {
            acc.set(
              data.date, { date: data.date, metric: data.metric, data_float: data.data_float, count: 1 }
            )
            return acc
          }
          const dateContent = acc.get(data.date)
          dateContent.data_float += data.data_float
          dateContent.count += 1
          return acc
        }, new Map())

        for (let result of groupSumCount.values()) {
          result.value = Math.round(((result.data_float/result.count) + Number.EPSILON) * 10000) / 10000
        }

        return [...groupSumCount.values()].map((data) => {
          return Object.assign(data, { day: new Date(data.date).getDate() })
        })
      } else if (this.store("frameSelected") === "frequency") {
        if(contextData.length === 0) return []
        return contextData.map(data => { 
          return { value: data.data_float }
        })
      } else if (this.store("frameSelected") === "pages") {
        if(contextData.length === 0) return []

        const groupSumCount = contextData.reduce((acc , data) => {
          if (!acc.get(data.path)) {
            acc.set(
              data.path, { path: data.path, metric: data.metric, data_float: data.data_float, count: 1 }
            )
            return acc
          }
          const pathContent = acc.get(data.path)
          pathContent.data_float += data.data_float
          pathContent.count += 1
          return acc
        }, new Map())

        for (let result of groupSumCount.values()) {
          result.value = Math.round(((result.data_float/result.count) + Number.EPSILON) * 10000) / 10000
        }

        const failingCoreVitals = [...groupSumCount.values()].filter((data) => {
          return data.value > targetLineValues(context).successLineValue
        })

        const highestToLowest = failingCoreVitals.slice().sort(
          (VitalsA, VitalsB) => VitalsB.value - VitalsA.value
        )

        return highestToLowest
      }
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
    if ((prop === "frameLoaded" || prop === "selectedDataVizData") && storeId === this.storeIdValue) {
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
