import { Controller } from "stimulus"
import Perfume from "perfume.js"

export default class extends Controller {
  static targets = [ "footer", "vitalsButton", "metrics", "lcp", "fid", "cls" ]
  static values = { 
    lcp: Object,
    fid: Object,
    cls: Object
  }
  static classes = [ "success", "warning", "error" ]

  initialize() {
    // Test for presence of one Core Web Vital metric and display button if present. This is currently
    // a good indicator of Chromium which only support Core Web Vitals metrics
    if (window.LayoutShift) this.vitalsButtonTarget.style.display = "block"
    window.addEventListener("DOMContentLoaded", (event) => {
      try {
        new Perfume({
          analyticsTracker: (options) => {
            if (!window.LayoutShift) return
            const { metricName, data, vitalsScore } = options
      
            switch (metricName) {
              case "navigationTiming":
                if (data && data.timeToFirstByte) {
                }
                break;
              case "fcp":
                break;
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
    this.coreWebVitalResponse("lcp", this.lcpValue, this.lcpTarget)
  }

  fidValueChanged() {
    this.coreWebVitalResponse("fid", this.fidValue, this.fidTarget)
  }

  clsValueChanged() {
    this.coreWebVitalResponse("cls", this.clsValue, this.clsTarget)
  }

  coreWebVitalResponse(cwv, value, target) {
    if (Object.entries(value).length === 0) return
    target.classList.add(this.alertColor(value))
    const replacementContent = `${this.alertSubstring(target.innerHTML)}${value.data}`
    target.innerHTML = cwv === "cls" ? replacementContent : `${replacementContent}ms`
  }

  alertColor(value) {
    switch (value.vitalsScore) {
      case "good":
        return this.successClass
      case "needsImprovement":
        return this.warningClass
      case "poor":
        return this.errorClass
    }
  }

  alertSubstring(currentContent) {
    const contentStart = currentContent.split("...")[0]
    return `${contentStart} ... `
  }
}
