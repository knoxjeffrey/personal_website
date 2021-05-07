import { Controller } from "stimulus"

export default class MinistryOfTruthController extends Controller {
  connect() {
    history.pushState(null, "", "/game/back-to-base/")
    history.pushState(null, "", "/game/ministry-of-truth/")
    window.onpopstate = () => location.reload()
  }
}
