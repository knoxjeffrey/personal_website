/**
 * @namespace javascripts.logs.log_layer
 * @description Creates a window.logLayer array and dispatches a customer event when set commands are 
 * performed on the array.
 */

import {logLayerListeners} from "~/javascripts/logs/log_layer_listeners"

const logLayer = (() => {
  "use strict"

  /**
   * Create a set trap for the array when data is added or removed. Creates a new custom events which
   * dispatches the data that has been added. By using Reflect, the original behavior of the push method
   * is restored while keeping the added behavior.
   * 
   * @const _logLayerPushHandler
   * @memberof javascripts.logs.log_layer
   */
  const _logLayerPushHandler = {
    set: (target, prop, value) => {
      if (prop !== "length") {
        const pushEvent = new CustomEvent("loglayerpush", { detail: value })
        window.dispatchEvent(pushEvent)
      }
      return Reflect.set(target, prop, value)
    }
  }

  /**
   * Create a proxy for a window.logLayer array, which will intercept set commands and introduce
   * additional functionality in order to handle logging in this application. Additionally sets up
   * listeners for events dispatched by the proxy.
   * 
   * @function init
   * @memberof javascripts.logs.log_layer
   */
  const init = () => {
    logLayerListeners.init()
    window.logLayer = new Proxy([], _logLayerPushHandler)
  }

  return { init }
})()

logLayer.init()
