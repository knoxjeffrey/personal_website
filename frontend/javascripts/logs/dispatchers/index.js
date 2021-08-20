/**
 * @namespace javascripts.logs.dispatchers.index
 * @description All push and turbo dispatchers are added here
 */

import { rum } from "~/javascripts/logs/dispatchers/rum"

export const dispatchers = (() => {
  const pushDispatchers = (log) => {
    rum.pushDispatcher(log)
  }

  const turboDispatchers = () => {
    rum.turboDispatcher()
  }

  return {
    pushDispatchers,
    turboDispatchers
  }
})()
