import { Controller } from "stimulus"
import AES from "crypto-js/aes"
import encUtf8 from "crypto-js/enc-utf8"

export default class HidingInPlainSightController extends Controller {
  static targets = [ "answer", "error", "unlock" ]

  submit() {
    if (this.answerTarget.value === "128aes") {
      this.errorTarget.style.display = "none"
      const bytes = AES.decrypt(this.unlockTarget.innerHTML, "128aes")
      this.unlockTarget.innerHTML = bytes.toString(encUtf8)
    } else {
      this.errorTarget.style.display = "block"
      this.errorTarget.innerHTML = `${this.answerTarget.value} is incorrect`
    }
  }
}
