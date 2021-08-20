import { logDataLayerDispatcher } from "~/javascripts/log/log_data_layer_dispatcher"

export const logDataLayerListeners = (() => {
  "use strict"

  const _pushListener = () => {
    window.addEventListener("logdatalayerpush", event => {
      logDataLayerDispatcher.pushHandler(event.detail)
    })
  }

  const _turboListener = () => {
    window.addEventListener("turbo:before-visit", () => {
      logDataLayerDispatcher.turboHandler()
    })
  }

  const init = () => {
    _pushListener()
    _turboListener()
  }

  return { init }
})()
