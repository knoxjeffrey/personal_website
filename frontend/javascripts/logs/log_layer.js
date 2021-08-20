/**
 * @namespace javascripts.log.log_layer
 * @description Listen for pushes to window.logLayer and dispatch a loglayerpush event
 */

import {logLayerListeners} from "~/javascripts/logs/log_layer_listeners"

const logLayer = (() => {
  "use strict"

  const _logLayerPushHandler = {
    set: (target, prop, value) => {
      if (prop !== "length") {
        const pushEvent = new CustomEvent("loglayerpush", { detail: value })
        window.dispatchEvent(pushEvent)
      }
      return Reflect.set(target, prop, value)
    }
  }

  const init = () => {
    logLayerListeners.init()
    window.logLayer = new Proxy([], _logLayerPushHandler)
  }

  return { init }
})()

logLayer.init()
