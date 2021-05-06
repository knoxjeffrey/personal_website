import { Controller } from "stimulus"

export default class MakeYourMarkController extends Controller {
  connect() {
    performance.mark("/game/responsive-design/")
  }
}
