import { Controller } from "stimulus"

export default class MinistryOfTruthController extends Controller {
  connect() {
    history.pushState(null, "", "/game/response-headers/")
    history.pushState(null, "", "/game/ministry-of-truth/")
    window.onpopstate = () => location.reload()
  }
}
