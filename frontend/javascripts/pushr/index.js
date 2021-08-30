/**
 * @namespace javascripts.pushr.index
 * @description Create a public interface for sending events and sets up event listeners.
 */

import { pushrDispatchers, eventListenerDispatchers } from "~/javascripts/pushr/dispatchers"

const publicInterface = {
  /**
   * Forwards the sent data onto dispatchers that will handle the events.
   * 
   * @function log
   * @memberof javascripts.pushr.index
   */
  log: (pushrObject) => {
    pushrDispatchers(pushrObject)
  }
}

/**
 * Create a public interface for sending events and sets up event listeners.
 * 
 * @function pushrInit
 * @memberof javascripts.pushr.index
 */
export const pushrInit = () => {
  eventListenerDispatchers()
  window.pushr = publicInterface
}
