/**
 * @namespace javascripts.pushr.dispatchers.index
 * @description All push and turbo dispatchers are added here
 */

import { rum } from "~/javascripts/pushr/dispatchers/rum"

export const dispatchers = (() => {
  const pushrDispatchers = (pushrObject) => {
    console.log("p-1")
    rum.pushrDispatcher(pushrObject)
  }

  const turboDispatchers = () => {
    console.log("t-1")
    rum.turboDispatcher()
    console.log("t-4")
    window.pushr.length = 0
  }

  return {
    pushrDispatchers,
    turboDispatchers
  }
})()
