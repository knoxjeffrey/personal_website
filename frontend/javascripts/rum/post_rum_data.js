/**
 * @namespace javascripts.rum.postRumData
 * @description Posts RUM data to a Netlify function
 */

const devHost = "localhost:3000"

/** 
 * Sends the Real User Metrics data to a Netlify background function.
 *
 * @function postRumData
 * @property {Object} loggerData - RUM logger data object
 * 
 * @memberof javascripts.rum.postRumData
 * */
export const postRumData = loggerData => {
  if (window.location.host === devHost) return

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
