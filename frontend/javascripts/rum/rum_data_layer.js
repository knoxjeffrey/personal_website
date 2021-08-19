/**
 * @class javascripts.rum.rumDataLayer
 * @classdesc Listen for pushes to window.rumDataLayer array and sends data to a Netlify function
 */

import { postRumData } from "~/javascripts/rum/post_rum_data"

class RumDataLayer {
  constructor() {
    this.isPostingRumData = false
    this.batchPostRumDataTimeout = undefined
    this.rumDataLayerPushHandler = {
      set: (target, prop, value) => {
        if (prop !== "length") {
          const pushEvent = new CustomEvent("rumdatalayerpush", {})
          window.dispatchEvent(pushEvent)
        }
        return Reflect.set(target, prop, value)
      }
    } 
    this.createRumDataLayer()
    this.addEventListeners()
  }

  createRumDataLayer() {
    window.rumDataLayer = new Proxy([], this.rumDataLayerPushHandler)
  }

  addEventListeners() {
    window.addEventListener("rumdatalayerpush", _event => {
      if (this.isPostingRumData === false) {
        this.isPostingRumData = true
        this.batchPostRumDataTimeout = setTimeout(this.batchPostRumData, 2000)
      }
    })
    
    window.addEventListener("turbo:before-visit", () => {
      clearTimeout(this.batchPostRumDataTimeout)
      this.batchPostRumData()
    })
  }

  batchPostRumData = () => {
    window.rumDataLayer.forEach(rumObject => postRumData(rumObject))
    window.rumDataLayer.length = 0
    this.isPostingRumData = false
  }
}

new RumDataLayer()

