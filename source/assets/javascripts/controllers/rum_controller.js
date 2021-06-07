import { Controller } from "stimulus"
import Perfume from "perfume.js"

/**
 * @class RUMController
 * @classdesc Stimulus controller to track Core Vitals and display results on page.
 * @extends Controller
 */
export default class extends Controller {
  /**
   * @property {Function} footer - targets the normal footer section
   * @property {Function} vitalsButton - targets the button to display CWV
   * @property {Function} metrics - targets the CWV section
   * @property {Function} lcp - tagets the text result of LCP
   * @property {Function} fid - tagets the text result of FID
   * @property {Function} cls - tagets the text result of CLS
   * @memberof RUMController
   * @static
   */
  static targets = [ "footer", "vitalsButton", "metrics", "lcp", "fid", "cls" ]

  /**
   * @property {Object} lcp - holds LCP data eg {"data":1201.705,"vitalsScore":"good"}
   * @property {Object} fid - holds FID data eg {"data":1.305,"vitalsScore":"good"}
   * @property {Object} cls - holds CLS data eg {"data":0.0049,"vitalsScore":"good"}
   * @memberof RUMController
   * @static
   */
  static values = { 
    lcp: Object,
    fid: Object,
    cls: Object
  }

  /**
   * @property {String} success - tagets the CSS to use for success highlighting on border and text
   * @property {String} warning - tagets the CSS to use for warning highlighting on border and text
   * @property {String} error - tagets the CSS to use for error highlighting on border and text
   */
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
    console.log(this.footerTarget)
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
