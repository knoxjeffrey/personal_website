import { Controller } from "stimulus"

export default class ErrorPageController extends Controller {
  initialize() {
    console.warn(
      "Good job! I told you it would be simple to start with. Want more? /game/get-to-know-each-other/"
    )
  }
}
