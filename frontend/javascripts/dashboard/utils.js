/**
 * @namespace javascripts.dashboard.utils
 */

/** 
 * Get the success and fail line values for the given context
 *
 * @function targetLineValues
 * @memberof javascripts.dashboard.utils
 */
export function targetLineValues(context) {
  if (context === "production") return { successLineValue: 40, failLineValue: 50 }
  if (context === "deploy-preview") return { successLineValue: 45, failLineValue: 55 }
  if (context === "cms") return { successLineValue: 35, failLineValue: 45 }
  if (context === "lcp") return { successLineValue: 2500, failLineValue: 4000 }
  if (context === "fid") return { successLineValue: 100, failLineValue: 300 }
  if (context === "cls") return { successLineValue: 0.1, failLineValue: 0.25 }
}

/** 
 * Get the minimum axis value for the given context
 *
 * @function minAxisValues
 * @memberof javascripts.dashboard.utils
 */
export function minAxisValues(context) {
  if (context === "production") return 60
  if (context === "deploy-preview") return 60
  if (context === "cms") return 60
  if (context === "lcp") return 5000
  if (context === "fid") return 400
  if (context === "cls") return 0.4
}

/** 
 * Get the x axis legend text for the given context
 *
 * @function minYAxisValues
 * @memberof javascripts.dashboard.utils
 */
export function yAxisTextValues(context) {
  if (context === "production") return "Build number"
  if (context === "deploy-preview") return "Build number"
  if (context === "cms") return "Build number"
  if (context === "lcp") return "Day"
  if (context === "fid") return "Day"
  if (context === "cls") return "Day"
}

/** 
 * Get the y axis unit of measurment in the tooltip for the given context
 *
 * @function yAxisMeasurementValues
 * @memberof javascripts.dashboard.utils
 */
 export function yAxisMeasurementValues(context) {
  if (context === "production") return " s"
  if (context === "deploy-preview") return " s"
  if (context === "cms") return " s"
  if (context === "lcp") return " ms"
  if (context === "fid") return " ms"
  if (context === "cls") return ""
}

/** 
 * Allow clicks on the given context
 *
 * @function allowClicks
 * @memberof javascripts.dashboard.utils
 */
 export function allowClicks(context) {
  if (context === "production") return true
  if (context === "deploy-preview") return true
  if (context === "cms") return true
  if (context === "lcp") return false
  if (context === "fid") return false
  if (context === "cls") return false
}
