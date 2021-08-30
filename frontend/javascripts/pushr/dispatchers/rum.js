/**
 * @namespace javascripts.pushr.dispatchers.rum
 * @description Handles the pushr events for Real User Metrics
 */

let isRumDispatching = false
let rumDispatchTimeout = undefined
let allowedRumMetrics = ["ttfb", "networkInfo", "fcp", "fid", "lcp", "cls"]
let rumMetricsCollected = []
let rumObjects = []

/**
 * If it is a rum event then push the rum data onto a new array for rum data. If the metric type isn't
 * one that is allow then we exit. If we have already collected it then we exit. A timeout will
 * be created if one is not already running. This timeout will allow for multiple logs that are fired
 * quickly, to be batched up and dispatched in one request rather than firing multiple requests.
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
  if (isRumDispatching === false) {
    isRumDispatching = true
    rumDispatchTimeout = setTimeout(batchPostRumData, 500)
  }
}

/**
 * Dispatch any remaining logs in rumObjects when leaving the page
 * 
 * @function leavePageDispatcher
 * @memberof javascripts.pushr.dispatchers.rum
 */
export const leavePageDispatcher = () => {
  clearTimeout(rumDispatchTimeout)
  if (rumObjects.length) batchPostRumData()
}

/**
 * When the rum data is sent, empty rumObjects and change the isRumDispatching to say the timeout
 * is over
 * 
 * @function batchPostRumData
 * @memberof javascripts.pushr.dispatchers.rum
 */
const batchPostRumData = () => {
  postRumData(rumObjects)
  rumObjects.length = 0
  isRumDispatching = false
}

/**
 * Post the rum data to a Netlify background function
 * 
 * @function postRumData
 * @memberof javascripts.pushr.dispatchers.rum
 */
const postRumData = rumData => {
  navigator.sendBeacon(
    "/.netlify/functions/rum_logger-background",
    JSON.stringify(rumData)
  )
}
