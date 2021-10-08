import { Controller } from "@hotwired/stimulus"

/**
 * @class CommentsController
 * @classdesc Stimulus controller to initialise Commento to allow users to view and make comments.
 * @extends Controller
 */
export default class extends Controller {
  /**
   * @property {Function} load - targets the button to load comments
   * @property {Function} commento - targets the div to initialise Commento
   * @memberof CommentsController
   * @static
   */
  static targets = [ "load", "commento" ]

  /** 
   * Triggered by a click event.
   * 
   * Hides the button for loading comments.
   * 
   * Adds top margin to the Commneto block and initialises Commento
   * 
   * @instance
   * @memberof CommentsController
   * @returns {void} N/A
   * */
  load() {
    this.loadTarget.style.display = "none"
    this.commentoTarget.classList.add("margin-top--xxl")
    window.commento.main()
  }
}
