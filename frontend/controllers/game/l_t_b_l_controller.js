import { Controller } from "@hotwired/stimulus"

/**
 * @class Game.LTBLController
 * @classdesc Stimulus controller for /game/let-there-be-light.
 * @extends Controller
 */
export default class LTBLController extends Controller {
  /** 
   * Triggered by a click event on a hidden pixel on the page.
   * Get the current background color of the <body> tag.
   * If it hasn't changed then naviagte to /game/make-it-brighter-before-you-can-continue/ which is a hint
   * If it has changed but isn't white then navigate to /game/try-another-color/ which is another hint
   * If it is white then navigate to the next puzzle.
   * 
   * @instance
   * @memberof Game.LTBLController
   * @returns {void} N/A
   * */
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
