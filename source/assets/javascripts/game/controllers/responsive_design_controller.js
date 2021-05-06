import { Controller } from "stimulus"

export default class ResponsiveDesignController extends Controller {
  static targets = [ "alert" ]

  connect() {
    window.onresize = () => {
      if (window.screen.width === 320 && window.screen.height === 480) {
        this.alertTarget.innerHTML = "/game/ministry-of-truth/"
      }
    }
  }
}
