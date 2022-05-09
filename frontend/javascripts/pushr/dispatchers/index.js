/**
 * @namespace javascripts.pushr.dispatchers.index
 * @description All push and turbo dispatchers are added here
 */

import { pushrDispatcher, leavePageDispatcher } from "~/javascripts/pushr/dispatchers/rum"

export const pushrDispatchers = (pushrObject) => pushrDispatcher(pushrObject)

export const eventListenerDispatchers = () => {
  /**
   * Dispatch all available metrics whenever the page is backgrounded or unloaded.
   */
  // window.addEventListener("visibilitychange", () => {
  //   if (document.visibilityState === "hidden") leavePageDispatcher()
  // })
  /**
   * Safari does not reliably fire the `visibilitychange` event when the page is being unloaded.
   * Therefore also dispatch any metrics in the dispatcher on the `pagehide` event
   **/
  // window.addEventListener("pagehide", () => leavePageDispatcher())
}
