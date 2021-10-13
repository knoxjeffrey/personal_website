/**
 * @namespace javascripts.pushr.dispatchers.rum
 * @description Handles the pushr events for Real User Metrics
 */

let allowedRumMetrics = ["ttfb", "networkInfo", "fcp", "fid", "lcp", "cls"]
let rumMetricsCollected = []
let rumObjects = []

/**
 * If it is a rum event then push the rum data onto a new array for rum data. If the metric type isn't
 * one that is allow then we exit. If we have already collected it then we exit.
 * 
 * @function pushrDispatcher
 * @memberof javascripts.pushr.dispatchers.rum
 */
export const pushrDispatcher = (pushrObject) => {
  if (pushrObject.event !== "rum") return
  if (!allowedRumMetrics.some(metric => metric === pushrObject.data.metric)) return
  if (rumMetricsCollected.some(metric => metric === pushrObject.data.metric)) return
  
  rumMetricsCollected.push(pushrObject.data.metric)
  rumObjects.push(pushrObject.data)
}

/**
 * Dispatch any logs in rumObjects when the page is backgrounded or unloaded
 * 
 * @function leavePageDispatcher
 * @memberof javascripts.pushr.dispatchers.rum
 */
export const leavePageDispatcher = () => {
  const path = "/.netlify/functions/rum_logger-background/"
  const body = JSON.stringify(rumObjects)
  
  if (rumObjects.length) batchPostRumData(path, body)
  rumObjects = []
}

/**
 * When the rum data is sent, empty the rumObjects array to ensure the data is not sent again. Use
 * `navigator.sendBeacon()` if available, falling back to `fetch()`.
 * 
 * @function batchPostRumData
 * @memberof javascripts.pushr.dispatchers.rum
 */
const batchPostRumData = (path, body) => {
  (navigator.sendBeacon && navigator.sendBeacon(path, body)) ||
  fetch(path, { body, method: "POST", keepalive: true })
}
