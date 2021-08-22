/**
 * @namespace javascripts.pushr.dispatchers.index
 * @description All push and turbo dispatchers are added here
 */

import { rum } from "~/javascripts/pushr/dispatchers/rum"

export const dispatchers = (() => {
  const pushrDispatchers = (log) => {
    rum.pushrDispatcher(log)
  }

  const turboDispatchers = () => {
    rum.turboDispatcher()
    window.pushr.length = 0
  }

  return {
    pushrDispatchers,
    turboDispatchers
  }
})()
