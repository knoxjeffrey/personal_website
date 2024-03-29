import { Controller } from "@hotwired/stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

const monthMapper = {
  1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct",
  11: "Nov", 12: "Dec"
}

/**
 * @class Dashboard.MonthsController
 * @classdesc Stimulus controller that handles the months buttons data and interaction.
 * @extends Controller
 **/
export default class extends Controller {
  static targets = [ "buttonGroup", "button" ]
  static values = {
    function: String,
    storeId: String,
    yearSelected: Number
  }

  /** 
   * Subscribe to the store.
   * 
   * @instance
   * @memberof Dashboard.MonthsController
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
   * @memberof Dashboard.MonthsController
   **/
  reconnect() {
    if (this.store("selectedDataVizData")) {
      this.storeUpdated("monthSelected", this.storeIdValue)
    }
  }

  /** 
   * Triggered when a year is set. Uses a document fragment to fully create the
   * months buttons before removing the load button and adding all the new months buttons. The last
   * button is set as selected
   * 
   * @instance
   * @memberof Dashboard.MonthsController
   **/
  yearSelectedValueChanged() {
    if (this.yearSelectedValue !== 0) {
      const yearAndMonths = this.store("yearsAndMonths").find(data => data.year === this.yearSelectedValue)
      let fragment = document.createDocumentFragment()

      yearAndMonths.month_numbers.forEach(monthNumber => {
        const buttonClone = this.buttonTarget.cloneNode(false)
        const button = fragment.appendChild(buttonClone)
        button.innerHTML = monthMapper[monthNumber]
      });

      this.buttonTargets.forEach(buttonTarget => buttonTarget.remove())
      this.buttonGroupTarget.appendChild(fragment)
      this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("selected"))
      this.buttonTargets[this.buttonTargets.length - 1].classList.add("selected")
    }
  }
  
  /** 
   * Ignores month if already clicked. Set the month clicked as selected in the store and gives the class
   * selected to the clicked month.
   * 
   * @instance
   * @memberof Dashboard.MonthsController
   **/
  monthClicked(event) {
    if (this.store("monthSelected") === parseInt(event.target.innerHTML)) return

    this.editStore(
      "monthSelected",
      parseInt(Object.keys(monthMapper).find(key => monthMapper[key] === event.target.innerHTML))
    )

    this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("selected"))
    event.target.classList.add("selected")
  }

  /** 
   * Fetch all of the data for the selected month. If the data for the month is already present
   * then it does not fetch again.
   * 
   * @instance
   * @memberof Dashboard.MonthsController
   **/
  fetchDataVizData() {
    const year = this.store("yearSelected")
    const month =this.store("monthSelected")

    const data = this.store("dataVizData")[`${year}${month}`]
    if (data) {
      this.editStore("selectedDataVizData", data)
    } else {
      this.editStore("fetchingDataVizData", true)

      fetch(`/.netlify/functions/supabase-get-api?year=${year}&month=${month}`, { 
        headers: { "Function-Name": this.functionValue }
      })
        .then(responseCheck => {
          if (!responseCheck.ok) { throw Error(responseCheck.status); }
          return responseCheck;
        })
        .then(res => res.json())
        .then(fetchedData => {
          this.editStore("fetchingDataVizData", false)
          let dataToUpdate = this.store("dataVizData")
          dataToUpdate[`${year}${month}`] = fetchedData
          this.editStore("dataVizData", dataToUpdate)
          this.editStore("selectedDataVizData", this.store("dataVizData")[`${year}${month}`])
        })
        .catch(error => {
          console.warn(error)
          this.editStore("fetchingDataVizData", false)
        });
    }
  }

  /** 
   * Triggered by the store whenever any store data changes. Fetches the relevant data when a month is
   * selected
   * 
   * @instance
   * @memberof Dashboard.MonthsController
   **/
  storeUpdated(prop, storeId) {
    this.yearSelectedValue = this.store("yearSelected")
    if (prop === "monthSelected" && storeId === this.storeIdValue) this.fetchDataVizData()
  }

  /** 
   * Unsubscribe from the store
   * 
   * @instance
   * @memberof Dashboard.MonthsController
   **/
  disconnect() {
    this.yearSelectedValue = ""
    this.unsubscribe()
  }
}
