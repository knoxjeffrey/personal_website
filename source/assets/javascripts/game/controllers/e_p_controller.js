/**
 * @namespace Controllers.Game
 * @author Jeff Knox
 * 
 * @description Error page controller to begin the game
 */

import { Controller } from "stimulus"

export default class EPController extends Controller {
  initialize() {
    console.warn(
      "Good job! I told you it would be simple to start with. Want more? /game/get-to-know-each-other/"
    )
  }
}
