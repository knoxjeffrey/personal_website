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
  }

  storeUpdated(store) {
    this.yearSelectedValue = store.yearSelected
  }

  disconnect() {
    this.unsubscribe()
  }
}
