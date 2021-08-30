/**
 * @namespace javascripts.pushr.dispatchers.index
 * @description All push and turbo dispatchers are added here
 */

import { pushrDispatcher, leavePageDispatcher } from "~/javascripts/pushr/dispatchers/rum"

export const pushrDispatchers = (pushrObject) => {
  pushrDispatcher(pushrObject)
}

export const eventListenerDispatchers = () => {
  window.addEventListener("turbo:before-visit", () => leavePageDispatcher())
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") leavePageDispatcher()
  })
}
