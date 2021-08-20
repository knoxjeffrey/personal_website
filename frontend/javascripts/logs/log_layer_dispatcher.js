import { postRumData } from "~/javascripts/logs/post_rum_data"

export const logLayerDispatcher = (() => {
  "use strict"

  let _isRumDispatching = false
  let _rumDispatchTimeout = undefined
  let _rumLogData = []

  const pushHandler = (log) => {
    if (log.logEvent === "rum") {
      _rumLogData.push(log.data)
      if (_isRumDispatching === false) {
        _isRumDispatching = true
        _rumDispatchTimeout = setTimeout(_batchPostLogData, 500)
      }
    }
  }

  const turboHandler = () => {
    clearTimeout(_rumDispatchTimeout)
    _batchPostLogData()

    window.logDataLayer.length = 0
  }

  const _batchPostLogData = () => {
    _rumLogData.forEach(logObject => postRumData(logObject))
    _rumLogData.length = 0
    _isRumDispatching = false
  }

  return {
    pushHandler,
    turboHandler
  }
})()
