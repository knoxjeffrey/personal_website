/**
 * @namespace javascripts.log.post_rum_data
 * @description Posts RUM data to a Netlify function
 */

const devHost = "localhost:3000"

/** 
 * Sends the Real User Metrics data to a Netlify background function.
 *
 * @function postRumData
 * @property {Object} loggerData - RUM logger data object
 * 
 * @memberof javascripts.log.post_rum_data
 * */
export const postRumData = loggerData => {
  console.log(loggerData)
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
