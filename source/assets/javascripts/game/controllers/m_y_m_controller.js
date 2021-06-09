import { Controller } from "stimulus"

/**
 * @class Game.MYMController
 * @classdesc Stimulus controller for /game/make-your-mark.
 * @extends Controller
 */
export default class MYMController extends Controller {
  /** 
   * Add a performance mark with the path of the next puzzle
   * Type `performance.getEntriesByType("mark")` in the console and you will get the next path.
   * 
   * @instance
   * @memberof Game.MYMController
   * @returns {void} N/A
   * */
  connect() {
    performance.mark("/game/responsive-design/")
  }
}
