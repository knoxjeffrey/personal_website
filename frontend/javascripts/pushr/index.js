/**
 * @namespace javascripts.pushr.index
 * @description Create a public interface for sending events and sets up event listeners.
 */

import { dispatchers } from "~/javascripts/pushr/dispatchers"

export const pushr = (() => {
  const _publicInterface = {
    /**
     * Forwards the sent data onto dispatchers that will handle the events.
     * 
     * @function send
     * @memberof javascripts.pushr.index
     */
    send: (pushrObject) => {
      dispatchers.pushrDispatchers(pushrObject)
    }
  }

  /**
   * A turbo event is fired before visiting a location, except when navigating by history and this sets
   * up dispatchers to handle when this happens. 
   * 
   * @function _turboListener
   * @memberof javascripts.pushr.index
   */
  const _turboListener = () => {
    window.addEventListener("turbo:before-visit", () => {
      dispatchers.turboDispatchers()
    })
  }

  /**
   * Create a public interface for sending events and sets up event listeners.
   * 
   * @function init
   * @memberof javascripts.pushr.index
   */
  const init = () => {
    _turboListener()
    window.pushr = _publicInterface
  }

  return { init }
})()
