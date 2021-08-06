import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"

export default class extends Controller {
  connect() {
    subscription(this)
    this.subscribe()
    if (!this.store().yearsAndMonths) this.yearsAndMonths()
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

  storeUpdated(store) {
    console.log(store.yearsAndMonths)
  }

  disconnect() {
    this.unsubscribe()
  }
}
