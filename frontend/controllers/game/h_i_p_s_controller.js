import { Controller } from "@hotwired/stimulus"
import { AES } from "crypto-es/lib/aes"
import { Utf8 } from 'crypto-es/lib/core.js'

/**
 * @class Game.HIPSController
 * @classdesc Stimulus controller for /game/hiding-in-plain-sight.
 * @extends Controller
 */
export default class HIPSController extends Controller {
  /**
   * @property {Function} answer - targets the text field input
   * @property {Function} error - targets the error message
   * @property {Function} unlock - targets the alert
   * @memberof Game.HIPSController
   * @static
   */
  static targets = [ "answer", "error", "unlock" ]

  /** 
   * If the answer matches `128aes`, the string in the alert is decrypted to reveal the path to the
   * next puzzle. Otherwise an error message is displayed.
   * 
   * @instance
   * @memberof Game.HIPSController
   * @returns {void} N/A
   * */
  submit(e) {
    e.preventDefault()
    
    if (this.answerTarget.value === "128aes") {
      this.errorTarget.style.display = "none"
      const bytes = AES.decrypt(this.unlockTarget.innerHTML, "128aes")
      this.unlockTarget.innerHTML = bytes.toString(Utf8)
    } else {
      this.errorTarget.style.display = "block"
      this.errorTarget.innerHTML = `${this.answerTarget.value} is incorrect`
    }
  }
}
