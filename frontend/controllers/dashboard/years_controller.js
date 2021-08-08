import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

export default class extends Controller {
  static targets = [ "buttonGroup", "button" ]
  static values = { status: String }

  connect() {
    subscription(this)
    this.subscribe()
    if (!this.store().netlifyBuildData) this.editStore("netlifyBuildData", {})
    if (!this.store().yearsAndMonths) this.yearsAndMonths()
    
    this.reconnect()
  }

  reconnect() {
    if (this.store().selectedNetlifyBuildData) {
      this.storeUpdated(this.store(), "yearsAndMonths")
    }
  }

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

  yearClicked(event) {
    if (this.store().yearSelected === parseInt(event.target.innerHTML)) return
    
    this.editStore("yearSelected", parseInt(event.target.innerHTML))
    const yearAndMonths = this.store().yearsAndMonths.find(data => data.year === this.store().yearSelected)
    this.editStore("months", yearAndMonths.month_numbers)
    this.editStore("monthSelected", this.store().months[this.store().months.length - 1])

    this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("selected"))
    event.target.classList.add("selected")
  }

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

  storeUpdated(store, prop) {
    if (prop === "yearsAndMonths") {
      this.editStore("years", store.yearsAndMonths.map(data => data.year))
      this.editStore("yearSelected", store.years[store.years.length - 1])
      this.editStore("months", store.yearsAndMonths.slice(-1).map(data => data.month_numbers).flat())
      this.editStore("monthSelected", store.months[store.months.length - 1])

      this.statusValue = "loaded"
    }
  }

  disconnect() {
    this.statusValue = "loading"
    this.unsubscribe()
  }
}
