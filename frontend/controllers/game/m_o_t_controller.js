import { Controller } from "@hotwired/stimulus"

/**
 * @class Game.MOTController
 * @classdesc Stimulus controller for /game/ministry-of-truth.
 * @extends Controller
 */
export default class MOTController extends Controller {
  /** 
   * Changes the previous history.
   * Clicking the back button won't work but type `history.back()` in the console and you'll get the
   * next puzzle.
   * 
   * @instance
   * @memberof Game.MOTController
   * @returns {void} N/A
   * */
  connect() {
    history.pushState(null, "", "/game/back-to-base/")
    history.pushState(null, "", "/game/ministry-of-truth/")
    window.onpopstate = () => location.reload()
  }
}
