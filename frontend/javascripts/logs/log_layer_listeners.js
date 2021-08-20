import { logLayerDispatcher } from "~/javascripts/logs/log_layer_dispatcher"

export const logLayerListeners = (() => {
  "use strict"

  const _pushListener = () => {
    window.addEventListener("loglayerpush", event => {
      logLayerDispatcher.pushHandler(event.detail)
    })
  }

  const _turboListener = () => {
    window.addEventListener("turbo:before-visit", () => {
      logLayerDispatcher.turboHandler()
    })
  }

  const init = () => {
    _pushListener()
    _turboListener()
  }

  return { init }
})()
