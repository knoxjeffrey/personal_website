import { Controller } from "stimulus"
import Perfume from "perfume.js"

export default class extends Controller {
  static values = { 
    fid: Object,
    lcp: Object,
    cls: Object
  }

  initialize() {
    window.addEventListener("DOMContentLoaded", (event) => {
      try {
        new Perfume({
          analyticsTracker: (options) => {
            const { metricName, data, vitalsScore } = options
      
            switch (metricName) {
              case "fid":
                this.fidValue = { data, vitalsScore }
                break;
              case "lcp":
                this.lcpValue = { data, vitalsScore }
                break;
              case "cls":
                this.clsValue = { data, vitalsScore }
                break;
            }
          }
        })
      }
      catch(error) {}
    })
  }
}
