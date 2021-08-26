/**
 * @namespace javascripts.pushr.dispatchers.rum
 * @description Handles the pushr events for Real User Metrics
 */

export const rum = (() => {
  let _isRumDispatching = false
  let _rumDispatchTimeout = undefined
  let _rumObjects = []

  /**
   * If it is a rum event then push the rum data onto a new array for rum data. A timeout will
   * be created if one is not already running. This timeout will allow for multiple logs that are fired
   * quickly, to be batched up and dispatched in one request rather than firing multiple requests.
   * 
   * @function pushrDispatcher
   * @memberof javascripts.pushr.dispatchers.rum
   */
  const pushrDispatcher = (pushrObject) => {
    if (pushrObject.event !== "rum") return
    
    _rumObjects.push(pushrObject.data)
    if (_isRumDispatching === false) {
      _isRumDispatching = true
      _rumDispatchTimeout = setTimeout(_batchPostRumData, 500)
    }
  }

  /**
   * Dispatch any remaining logs in _rumObjects when leaving the page
   * 
   * @function turboDispatcher
   * @memberof javascripts.pushr.dispatchers.rum
   */
  const turboDispatcher = () => {
    clearTimeout(_rumDispatchTimeout)
    if (_rumObjects.length) _batchPostRumData()
  }

  /**
   * When the rum data is sent, empty _rumObjects and change the _isRumDispatching to say the timeout
   * is over
   * 
   * @function _batchPostRumData
   * @memberof javascripts.pushr.dispatchers.rum
   */
  const _batchPostRumData = () => {
    _postRumData(_rumObjects)
    _rumObjects.length = 0
    _isRumDispatching = false
  }

  /**
   * Post the rum data to a Netlify background function
   * 
   * @function _postRumData
   * @memberof javascripts.pushr.dispatchers.rum
   */
  const _postRumData = rumData => {
    fetch("/.netlify/functions/rum_logger-background", { 
      method: "POST",
      body: JSON.stringify(rumData)
    })
      .then(responseCheck => {
        if (!responseCheck.ok) { throw Error(responseCheck.status); }
      })
      .catch(error => {
        console.warn(error)
      })
  }

  return {
    pushrDispatcher,
    turboDispatcher
  }
})()
