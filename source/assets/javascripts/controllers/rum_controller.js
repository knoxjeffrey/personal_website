import { Controller } from "stimulus"
import Perfume from "perfume.js"

/**
 * @class RUMController
 * @classdesc Stimulus controller to track Core Vitals and display results on page.
 * @extends Controller
 */
export default class RUMController extends Controller {
  /**
   * Will be set on `initialize` with the current Unix timestamp in milliseconds
   * 
   * @type {Number}
   * @memberof RUMController
   */
  rumIdentifier

  /**
   * @property {Function} footer - targets the normal footer section
   * @property {Function} vitalsButton - targets the button to display CWV
   * @property {Function} metrics - targets the CWV section
   * @property {Function} lcp - targets the text result of LCP
   * @property {Function} fid - targets the text result of FID
   * @property {Function} cls - targets the text result of CLS
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
   * @property {String} success - targets the CSS to use for success highlighting on border and text
   * @property {String} warning - targets the CSS to use for warning highlighting on border and text
   * @property {String} error - targets the CSS to use for error highlighting on border and text
   * @memberof RUMController
   * @static
   */
  static classes = [ "success", "warning", "error" ]

  /** 
   * Initialises perfume.js only on DOMContentLoaded. The CWV's are only available on a full page
   * load so this prevents the initialisation on Turbo drive navigations
   *
   * @instance
   * @memberof RUMController
   * @returns {void} N/A
   * */
  initialize() {
    this.rumIdentifier = Date.now()
    // Test for presence of one Core Web Vital metric and display button if present. This is currently
    // a good indicator of Chromium which only support Core Web Vitals metrics
    if (window.LayoutShift) this.vitalsButtonTarget.style.display = "block"
    window.addEventListener("DOMContentLoaded", (event) => {
      try {
        new Perfume({
          analyticsTracker: (options) => {
            const { metricName, data, vitalsScore } = options
      
            switch (metricName) {
              case "navigationTiming":
                if (data && data.timeToFirstByte) {
                  this.rumLogger("ttfb", data.timeToFirstByte)
                }
                break;
              case "networkInformation":
                if (data && data.effectiveType) {
                  this.rumLogger("networkInfo", data.effectiveType)
                }
                break;
              case "fcp":
                this.rumLogger("fcp", data, vitalsScore)
                break;
              case "lcp":
                this.rumLogger("lcp", data, vitalsScore)
                this.lcpValue = { data, vitalsScore }
                break;
              case "fid":
                this.rumLogger("fid", data, vitalsScore)
                this.fidValue = { data, vitalsScore }
                break;
              case "cls":
                this.rumLogger("cls", data, vitalsScore)
                this.clsValue = { data, vitalsScore }
                break;
            }
          }
        })
      }
      catch(error) {}
    })
  }

  /** 
   * Displays the normal footer again when the controller disconnects and hides the CWV section
   *
   * @instance
   * @memberof RUMController
   * @returns {void} N/A
   * */
  disconnect() {
    this.footerTarget.style.display = "block"
    this.metricsTarget.style.display = "none"
  }

  /** 
   * Displays the CWV section in the footer and hides the normal footer
   *
   * @instance
   * @memberof RUMController
   * @returns {void} N/A
   * */
  reveal() {
    this.footerTarget.style.display = "none"
    this.metricsTarget.style.display = "block"
  }

  /** 
   * Sends the Real User Metric data to a Netlify background function.
   * 
   * Netlify background functions will immediately return a 202 to indicate that the bckground function
   * has been triggered but we are not to wait for a result as the function will be queued and could
   * take as much as 15 mins to run.
   *
   * @instance rumLogger
   * @property {String} metric - string identifying the RUM metric
   * @property {(String|Number)} data - value associated with the metric
   * @property {String} [vitalsScore] - CWV reading of good, needs improvement or poor
   * 
   * @memberof RUMController
   * @returns {void} N/A
   * @see visitorIsBot
   * @see postRumLoggerData
   * 
   * @example
   * this.rumLogger("cls", 0, "good")
   * @example
   * this.rumLogger("networkInformation", "4g")
   * */
  rumLogger(metric, data, vitalsScore = "null") {
    const loggerData = {
      identifier: this.rumIdentifier,
      path: window.location.pathname,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      unixTimeStamp: Math.floor(Date.now() / 1000),
      userAgent: window.navigator.userAgent,
      metric,
      data,
      vitalsScore
    }
    if (this.visitorIsBot(loggerData.userAgent)) return
    this.postRumLoggerData(loggerData)
  }

  /** 
   * Checks if the part of the userAgent matches against one of the given bot names
   *
   * @instance visitorIsBot
   * @property {String} userAgent - the userAgent string
   * 
   * @memberof RUMController
   * @returns {Boolean}
   * */
  visitorIsBot(userAgent) {
    const botNames = [
      "Googlebot" ,"Bingbot", "Slurp", "DuckDuckBot", "Baiduspider", "YandexBot", "Sogou", "Exabot"
    ]
    if (botNames.some(name => userAgent.includes(name))) return true
  }

  /** 
   * Sends the Real User Metrics data to a Netlify background function.
   *
   * @instance postRumLoggerData
   * @property {Object} loggerData - RUM logger data object
   * 
   * @memberof RUMController
   * @returns {void}
   * */
  postRumLoggerData(loggerData) {
    fetch("/.netlify/functions/rum_logger-background", { 
      method: "POST",
      body: JSON.stringify(loggerData)
    })
      .then(responseCheck => {
        if (!responseCheck.ok) { throw Error(responseCheck.status); }
      })
      .catch(error => {
        console.warn(error)
      });
  }

  /** 
   * LCP value change callback which calls coreWebVitalResponse
   *
   * @instance lcpValueChanged
   * @memberof RUMController
   * @returns {void} N/A
   * @see coreWebVitalResponse
   * */
  lcpValueChanged() {
    this.coreWebVitalResponse("lcp", this.lcpValue, this.lcpTarget)
  }

  /** 
   * FID value change callback which calls coreWebVitalResponse
   *
   * @instance fidValueChanged
   * @memberof RUMController
   * @returns {void} N/A
   * @see coreWebVitalResponse
   * */
  fidValueChanged() {
    this.coreWebVitalResponse("fid", this.fidValue, this.fidTarget)
  }

  /** 
   * CLS value change callback which calls coreWebVitalResponse
   *
   * @instance clsValueChanged
   * @memberof RUMController
   * @returns {void} N/A
   * @see coreWebVitalResponse
   * */
  clsValueChanged() {
    this.coreWebVitalResponse("cls", this.clsValue, this.clsTarget)
  }

  /** 
   * Returns if no value object present. This will happen on the first runs of the value change callbacks
   * on initial page load.
   * 
   * Adds a relevent class for the alert colour.
   * 
   * Replaces the `... waiting` text with the CWV score.
   *
   * @instance coreWebVitalResponse
   * @property {String} cwv - string identifying the CWV
   * @property {Object} value - CWV object with score and reading of good, needs improvement or poor
   * @property {String} target - string identifying the target in the DOM 
   * 
   * @memberof RUMController
   * @returns {void} N/A
   * @see alertColor
   * @see alertSubstring
   * @example
   * this.coreWebVitalResponse("cls", this.clsValue, this.clsTarget)
   * */
  coreWebVitalResponse(cwv, value, target) {
    if (Object.entries(value).length === 0) return
    target.classList.add(this.alertColor(value))
    const replacementContent = `${this.alertSubstring(target.innerHTML)}${value.data}`
    target.innerHTML = cwv === "cls" ? replacementContent : `${replacementContent}ms`
  }

  /** 
   * CLS value change callback which calls coreWebVitalResponse
   *
   * @instance alertColor
   * @property {String} value - CWV rating of good, needsImprovement or poor
   * 
   * @memberof RUMController
   * @returns {String} The Stimulus class target
   * @example
   * this.alertColor("good")
   * */
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

  /** 
   * Splits the string at `...` and returns the text on LHS with `...` on the end
   *
   * @instance alertSubstring
   * @property {String} currentContent - The text associated with the CWV 
   * 
   * @memberof RUMController
   * @returns {String} eg. Largest Contentful Paint ... 
   * @example
   * this.alertSubstring("Largest Contentful Paint ... waiting")
   * */
  alertSubstring(currentContent) {
    const contentStart = currentContent.split("...")[0]
    return `${contentStart} ... `
  }
}
