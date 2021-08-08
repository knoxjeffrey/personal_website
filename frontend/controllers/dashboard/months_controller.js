import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

const monthMapper = {
  1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct",
  11: "Nov", 12: "Dec"
}

export default class extends Controller {
  static targets = [ "buttonGroup", "button" ]
  static values = { yearSelected: Number }

  connect() {
    subscription(this)
    this.subscribe()
  }

  yearSelectedValueChanged() {
    if (!isNaN(this.yearSelectedValue)) {
      const yearAndMonths = this.store().yearsAndMonths.find(data => data.year === this.yearSelectedValue)
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
  
  monthClicked(event) {
    this.editStore(
      "monthSelected",
      parseInt(Object.keys(monthMapper).find(key => monthMapper[key] === event.target.innerHTML))
    )

    this.buttonTargets.forEach(buttonTarget => buttonTarget.classList.remove("selected"))
    event.target.classList.add("selected")

    this.fetchNetlifyBuildData()
  }

  fetchNetlifyBuildData() {
    const year = this.store().yearSelected
    const month =this.store().monthSelected
    let netlifyBuildDataToUpdate = this.store().netlifyBuildData

    const data = this.store().netlifyBuildData[`${year}${month}`]
    if (data) {
      this.editStore("selectedNetlifyBuildData", data)
    } else {
      fetch(`/.netlify/functions/supabase-get-api?year=${year}&month=${month}`, { 
        headers: { "Function-Name": "netlify_build_data_for_year_and_month" }
      })
        .then(responseCheck => {
          if (!responseCheck.ok) { throw Error(responseCheck.status); }
          return responseCheck;
        })
        .then(res => res.json())
        .then(buildData => {
          netlifyBuildDataToUpdate[`${year}${month}`] = buildData
          this.editStore("netlifyBuildData", netlifyBuildDataToUpdate)
        })
        .catch(error => {
          console.warn(error)
          netlifyBuildDataToUpdate[`${year}${month}`] = undefined
          this.editStore("netlifyBuildData", netlifyBuildDataToUpdate)
        });
    }
  }

  storeUpdated(store, prop) {
    this.yearSelectedValue = store.yearSelected
    if (prop === "monthSelected" || prop === "netlifyBuildData" && store.monthSelected) {
      this.fetchNetlifyBuildData()
    }
  }

  disconnect() {
    this.unsubscribe()
  }
}
