import { Controller } from "stimulus"

export default class LTBLController extends Controller {
  next() {
    const body = document.querySelector("body")
    const backgroundColor = window.getComputedStyle(body).getPropertyValue("background-color")
    switch (backgroundColor) {
      case "rgb(34, 34, 37)":
        location.href = "/game/make-it-brighter-before-you-can-continue/"
        break;
      case "rgb(255, 255, 255)":
        location.href = "/game/go-to-the-source/"
        break;
      default:
        location.href = "/game/try-another-color/"
    }                                    
  }
}
