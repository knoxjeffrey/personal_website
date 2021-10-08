import { Controller } from "@hotwired/stimulus"

/**
 * @class Game.RDController
 * @classdesc Stimulus controller for /game/responsive-design.
 * @extends Controller
 */
export default class RDController extends Controller {
  static targets = [ "alert" ]

  /** 
   * In Dev Tools change the resposive screen size to 320x480 and the path to the next puzzle will
   * appear in the red box.
   * 
   * @instance
   * @memberof Game.RDController
   * @returns {void} N/A
   * */
  connect() {
    window.onresize = () => {
      if (window.screen.width === 320 && window.screen.height === 480) {
        this.alertTarget.innerHTML = "/game/ministry-of-truth/"
      }
    }
  }
}
