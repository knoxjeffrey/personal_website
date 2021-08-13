import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

/**
 * @class Dashboard.YearsController
 * @classdesc Stimulus controller that fetches the data to populate the years and months buttons.
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "buttonGroup", "button" ]
  static values = { status: String }

  /** 
   * Subscribe to the store. Setup netlifyBuildData and then fetch years and months data
   * 
   * @instance
   * @memberof Dashboard.YearsController
   **/
  connect() {
    subscription(this)
    this.subscribe()
    if (!this.store().netlifyBuildData) this.editStore("netlifyBuildData", {})
    if (!this.store().yearsAndMonths) this.yearsAndMonths()
    
    this.reconnect()
  }

  /** 
   * Handles a repeated Turbo visit to the dashboard page. Currently not valid as I've set page to reload
   * because otheriwse d3 won't rebuild the visualisation
   * 
   * @instance
   * @memberof Dashboard.YearsController
   **/
  reconnect() {
    if (this.store().selectedNetlifyBuildData) {
      this.storeUpdated(this.store(), "yearsAndMonths")
    }
  }

  /** 
   * Triggered when the years and months data is loaded. Uses a document fragment to fully create the
   * years buttons before removing the load button and adding all the new years buttons. The last button
   * is set as selected
   * 
   * @instance
   * @memberof Dashboard.YearsController
   **/
  statusValueChanged() {
    if (this.statusValue === "loaded") {
      let fragment = document.createDocumentFragment()
      this.store().years.forEach(year => {
        const buttonClone = this.buttonTarget.cloneNode(false)
        const button = fragment.appendChild(buttonClone)
        button.innerHTML = year
      });
      this.buttonTarget.remove()
      this.buttonGroupTarget.appendChild(fragment)
      this.buttonTargets[this.buttonTargets.length - 1].classList.add("selected")
    }
  }

  /** 
   * Ignores year if already clicked. Set the months data for the selected year. Set the last month as
   * selected in the store and gives the class selected to the clicked year.
   * 
   * @instance
   * @memberof Dashboard.YearsController
   **/
  yearClicked(event) {
    if (this.store().yearSelected === parseInt(event.target.innerHTML)) return
    
    this.editStore("yearSelected", parseInt(event.target.innerHTML))
    const yearAndMonths = this.store().yearsAndMonths.find(data => data.year === this.store().yearSelected)
    this.editStore("months", yearAndMonths.month_numbers)
    this.editStore("monthSelected", this.store().months[this.store().months.length - 1])

    this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("selected"))
    event.target.classList.add("selected")
  }

  /** 
   * Fetch the data for years and months 
   * 
   * @instance
   * @memberof Dashboard.YearsController
   **/
  yearsAndMonths() {
    fetch("/.netlify/functions/supabase-get-functions", { 
      headers: { "Function-Name": "netlify_deploy_data_years_and_months" }
    })
      .then(responseCheck => {
        if (!responseCheck.ok) { throw Error(responseCheck.status); }
        return responseCheck;
      })
      .then(res => res.json())
      .then(yearsAndMonths => {
        this.editStore("yearsAndMonths", yearsAndMonths)
      })
      .catch(error => {
        console.warn(error)
        this.editStore("yearsAndMonths", undefined)
      });
  }

  /** 
   * Triggered by the store whenever any store data changes. Sets us the store when yearsAndMonths data
   * has been set following the fetch statement
   * 
   * @instance
   * @memberof Dashboard.YearsController
   **/
  storeUpdated(store, prop) {
    if (prop === "yearsAndMonths") {
      this.editStore("years", store.yearsAndMonths.map(data => data.year))
      this.editStore("yearSelected", store.years[store.years.length - 1])
      this.editStore("months", store.yearsAndMonths.slice(-1).map(data => data.month_numbers).flat())
      this.editStore("monthSelected", store.months[store.months.length - 1])

      this.statusValue = "loaded"
    }
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.YearsController
   **/
  disconnect() {
    this.statusValue = "loading"
    this.unsubscribe()
  }
}
