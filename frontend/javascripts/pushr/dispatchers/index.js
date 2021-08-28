/**
 * @namespace javascripts.pushr.dispatchers.index
 * @description All push and turbo dispatchers are added here
 */

import { rum } from "~/javascripts/pushr/dispatchers/rum"

export const dispatchers = (() => {
  const pushrDispatchers = (pushrObject) => {
    rum.pushrDispatcher(pushrObject)
  }

  const turboDispatchers = () => {
    rum.turboDispatcher()
  }

  return {
    pushrDispatchers,
    turboDispatchers
  }
})()
