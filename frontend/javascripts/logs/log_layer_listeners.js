/**
 * @namespace javascripts.logs.log_layer_listeners
 * @description Listen for pushes to window.logLayer and dispatch a loglayerpush event
 */

import { dispatchers } from "~/javascripts/logs/dispatchers"

export const logLayerListeners = (() => {
  "use strict"

  /**
   * Listens for the custom loglayerpush event when data is pushed to window.logLayer and passes the data
   * onto dispatchers that will handle the log events
   * 
   * @function _pushListener
   * @memberof javascripts.logs.log_layer_listeners
   */
  const _pushListener = () => {
    window.addEventListener("loglayerpush", event => {
      dispatchers.pushDispatchers(event.detail)
    })
  }

  /**
   * A turbo event is fired before visiting a location, except when navigating by history and this sets
   * up dispatchers to handle the logs when this happens. 
   * 
   * @function _turboListener
   * @memberof javascripts.logs.log_layer_listeners
   */
  const _turboListener = () => {
    window.addEventListener("turbo:before-visit", () => {
      dispatchers.turboDispatchers()
    })
  }

  /**
   * Initialises the listeners 
   * 
   * @function init
   * @memberof javascripts.logs.log_layer_listeners
   */
  const init = () => {
    _pushListener()
    _turboListener()
  }

  return { init }
})()
