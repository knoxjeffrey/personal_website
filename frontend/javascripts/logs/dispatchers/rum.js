/**
 * @namespace javascripts.logs.dispatchers.rum
 * @description Handles the logging events for Real User Metrics
 */

export const rum = (() => {
  "use strict"

  const _devHost = "localhost:3000"
  let _isRumDispatching = false
  let _rumDispatchTimeout = undefined
  let _rumLogData = []

  /**
   * If it is a rum log event then push the log data onto a new array for rum data. A timeout will
   * be created if one is not already running. This timeout will allow for multiple logs that are fired
   * quickly, to be batched up and dispatched in one request ratehr than firing multiple requests.
   * 
   * @function pushDispatcher
   * @memberof javascripts.logs.dispatchers.rum
   */
  const pushDispatcher = (log) => {
    if (log.logEvent !== "rum") return
    
    _rumLogData.push(log.data)
    if (_isRumDispatching === false) {
      _isRumDispatching = true
      _rumDispatchTimeout = setTimeout(_batchPostLogData, 500)
    }
  }

  /**
   * Dispatch any remaining logs in _rumLogData when leaving the page and also reset the
   * window.logDataLayer so it starts empty on the next page transition
   * 
   * @function turboDispatcher
   * @memberof javascripts.logs.dispatchers.rum
   */
  const turboDispatcher = () => {
    clearTimeout(_rumDispatchTimeout)
    _batchPostLogData()

    window.logLayer.length = 0
  }

  /**
   * When the rum data is sent, empty _rumLogData and change the _isRumDispatching to say the timeout
   * is over
   * 
   * @function _batchPostLogData
   * @memberof javascripts.logs.dispatchers.rum
   */
  const _batchPostLogData = () => {
    _rumLogData.forEach(logObject => _postRumData(logObject))
    _rumLogData.length = 0
    _isRumDispatching = false
  }

  /**
   * Post the rum data to a Netlify background function
   * 
   * @function _postRumData
   * @memberof javascripts.logs.dispatchers.rum
   */
  const _postRumData = loggerData => {
    if (window.location.host === _devHost) return
  
    fetch("/.netlify/functions/rum_logger-background", { 
      method: "POST",
      body: JSON.stringify(loggerData)
    })
      .then(responseCheck => {
        if (!responseCheck.ok) { throw Error(responseCheck.status); }
      })
      .catch(error => {
        console.warn(error)
      })
  }

  return {
    pushDispatcher,
    turboDispatcher
  }
})()
