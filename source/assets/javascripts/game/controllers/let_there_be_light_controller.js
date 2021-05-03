import { Controller } from "stimulus"

export default class LetThereBeLightController extends Controller {
  next() {
    const body = document.querySelector("body")
    const backgroundColor = window.getComputedStyle(body).getPropertyValue("background-color")
    location.href = backgroundColor === "rgb(255, 255, 255)" ? 
                                        "/game/go-to-the-source/" :
                                        "/game/maybe-try-changing-the-background-color"
  }
}
