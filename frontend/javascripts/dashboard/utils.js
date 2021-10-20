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
 * @function axisTextValues
 * @memberof javascripts.dashboard.utils
 */
export function axisTextValues(context) {
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
 * @function axisMeasurementValues
 * @memberof javascripts.dashboard.utils
 */
 export function axisMeasurementValues(context) {
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

/** 
 * Return all objects that have the key value within the given percentile
 *
 * @function metricsInPercentile
 * @memberof javascripts.dashboard.utils
 */
export function metricsInPercentile(data, key, percentile) {
  const selectedValues = data.map((object) => object[key])
  const sortedValues = sortNumberArray(selectedValues)
  const percentileLimit = percentileValue(sortedValues, percentile)
  return data.filter((object) => object[key] <= percentileLimit )
}

/** 
 * Sort the numbers from smallest to largest
 *
 * @function sortNumberArray
 * @memberof javascripts.dashboard.utils
 */
function sortNumberArray(arr) {
  return arr.sort((a, b) => a - b)
}

/** 
 * Get the value for the given percentile
 *
 * @function percentileValue
 * @memberof javascripts.dashboard.utils
 */
function percentileValue(arr, p) {
  if (arr.length === 0) return 0;
  if (typeof p !== "number") throw new TypeError("p must be a number");
  if (p <= 0) return arr[0];
  if (p >= 1) return arr[arr.length - 1];

  let index = (arr.length - 1) * p,
      lower = Math.floor(index),
      upper = lower + 1,
      weight = index % 1

  if (upper >= arr.length) return arr[lower];
  return arr[lower] * (1 - weight) + arr[upper] * weight;
}

export function percentage(total, value) {
  return Math.round(
    (((value / total) * 100) + Number.EPSILON) * 10
  ) / 10
}
