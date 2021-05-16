import { Controller } from "stimulus"
import Perfume from "perfume.js"

export default class extends Controller {
  static targets = [ "footer", "metrics", "lcp", "fid", "cls" ]
  static values = { 
    lcp: Object,
    fid: Object,
    cls: Object
  }

  initialize() {
    window.addEventListener("DOMContentLoaded", (event) => {
      try {
        new Perfume({
          analyticsTracker: (options) => {
            const { metricName, data, vitalsScore } = options
      
            switch (metricName) {
              case "lcp":
                this.lcpValue = { data, vitalsScore }
                break;
              case "fid":
                this.fidValue = { data, vitalsScore }
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

  disconnect() {
    this.footerTarget.style.display = "block"
    this.metricsTarget.style.display = "none"
  }

  reveal() {
    this.footerTarget.style.display = "none"
    this.metricsTarget.style.display = "block"
  }

  lcpValueChanged() {
    if (Object.entries(this.lcpValue).length === 0) return
    this.lcpTarget.classList.add(this.alertColor(this.lcpValue))
    const replacementContent = `${this.alertSubstring(this.lcpTarget.innerHTML)}`
    this.lcpTarget.innerHTML = `${replacementContent}${this.lcpValue.data}ms`
  }

  fidValueChanged() {
    if (Object.entries(this.fidValue).length === 0) return
    this.fidTarget.classList.add(this.alertColor(this.fidValue))
    const replacementContent = `${this.alertSubstring(this.fidTarget.innerHTML)}`
    this.fidTarget.innerHTML = `${replacementContent}${this.fidValue.data}ms`
  }

  clsValueChanged() {
    if (Object.entries(this.clsValue).length === 0) return
    this.clsTarget.classList.add(this.alertColor(this.clsValue))
    const replacementContent = `${this.alertSubstring(this.clsTarget.innerHTML)}`
    this.clsTarget.innerHTML = `${replacementContent}${this.clsValue.data}`
  }

  alertColor(value) {
    switch (value.vitalsScore) {
      case "good":
        return "terminal-alert-success"
      case "needsImprovement":
        return "terminal-alert-warning"
      case "poor":
        return "terminal-alert-error"
    }
  }

  alertSubstring(currentContent) {
    const contentStart = currentContent.split("...")[0]
    return `${contentStart}...`
  }
}
