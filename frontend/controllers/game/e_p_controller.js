import { Controller } from "@hotwired/stimulus"

/**
 * @class Game.EPController
 * @classdesc Stimulus controller on the 404 page to start the game with the first answer.
 * @extends Controller
 */
export default class EPController extends Controller {
  /** 
   * Prints a console log with the first answer in the game with a path to the next puzzle.
   * 
   * @instance
   * @memberof Game.EPController
   * @returns {void} N/A
   * */
  initialize() {
    console.warn(
      "Good job! I told you it would be simple to start with. Want more? /game/get-to-know-each-other/"
    )
  }
}
