/**
 * @namespace javascripts.log.log_data_layer
 * @description Listen for pushes to window.logDataLayer and dispatch logdatalayerpush event
 */

import {logDataLayerListeners} from "~/javascripts/log/log_data_layer_listeners"

const logDataLayer = (() => {
  "use strict"

  const _logDataLayerPushHandler = {
    set: (target, prop, value) => {
      if (prop !== "length") {
        const pushEvent = new CustomEvent("logdatalayerpush", { detail: value })
        window.dispatchEvent(pushEvent)
      }
      return Reflect.set(target, prop, value)
    }
  }

  const init = () => {
    logDataLayerListeners.init()
    window.logDataLayer = new Proxy([], _logDataLayerPushHandler)
  }

  return { init }
})()

logDataLayer.init()
