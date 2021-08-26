/**
 * @namespace javascripts.pushr.pushr_listeners
 * @description Listen for pushes to window.pushr and handles turbo transition
 */

import { dispatchers } from "~/javascripts/pushr/dispatchers"

export const pushrListeners = (() => {
  /**
   * Listens for the custom pushrset event when data is pushed to window.pushr and passes the data
   * onto dispatchers that will handle the log events
   * 
   * @function _pushListener
   * @memberof javascripts.pushr.pushr_listeners
   */
  const _pushrsetListener = () => {
    window.addEventListener("pushrset", event => {
      dispatchers.pushrDispatchers(event.detail)
    })
  }

  /**
   * A turbo event is fired before visiting a location, except when navigating by history and this sets
   * up dispatchers to handle the logs when this happens. 
   * 
   * @function _turboListener
   * @memberof javascripts.pushr.pushr_listeners
   */
  const _turboListener = () => {
    window.addEventListener("turbo:before-visit", () => {
      console.log("turbo:before-visit")
      dispatchers.turboDispatchers()
    })
  }

  /**
   * Initialises the listeners 
   * 
   * @function init
   * @memberof javascripts.pushr.pushr_listeners
   */
  const init = () => {
    _pushrsetListener()
    _turboListener()
  }

  return { init }
})()
