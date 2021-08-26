/**
 * @namespace javascripts.pushr.index
 * @description Creates a window.pushr array and dispatches a custom event when set commands are 
 * performed on the array.
 */

import { pushrListeners } from "~/javascripts/pushr/pushr_listeners"

export const pushr = (() => {
  /**
   * Create a set trap for the array when data is added or removed. Creates a new custom event which
   * dispatches the data that has been added. By using Reflect, the original behavior of the push method
   * is restored while keeping the added behavior.
   * 
   * @const _pushrHandler
   * @memberof javascripts.pushr.index
   */
  const _pushrHandler = {
    set: (target, prop, value) => {
      if (prop !== "length") {
        const pushEvent = new CustomEvent("pushrset", { detail: value })
        window.dispatchEvent(pushEvent)
      }
      return Reflect.set(target, prop, value)
    }
  }

  /**
   * Create a proxy for a window.pushr array, which will intercept set commands and introduce
   * additional functionality in order to handle logging in this application. Additionally sets up
   * listeners for events dispatched by the proxy.
   * 
   * @function init
   * @memberof javascripts.pushr.index
   */
  const init = () => {
    pushrListeners.init()
    window.pushr = new Proxy([], _pushrHandler)
  }

  return { init }
})()
