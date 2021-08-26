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
    console.log("p-2")
    if (pushrObject.event !== "rum") return
    console.log("p-3")
    _rumObjects.push(pushrObject.data)
    if (_isRumDispatching === false) {
      console.log("p-4")
      _isRumDispatching = true
      console.log("p-5")
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
    console.log("t-2")
    clearTimeout(_rumDispatchTimeout)
    console.log("t-3")
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
    console.log("b-1")
    _postRumData(_rumObjects)
    console.log("b-2")
    _rumObjects.length = 0
    console.log("b-3")
    _isRumDispatching = false
  }

  /**
   * Post the rum data to a Netlify background function
   * 
   * @function _postRumData
   * @memberof javascripts.pushr.dispatchers.rum
   */
  const _postRumData = rumData => {
    console.log("r-1")
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
