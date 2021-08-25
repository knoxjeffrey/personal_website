import { pushr } from "~/javascripts/pushr"
import * as Turbo from "@hotwired/turbo"
import { Application } from "stimulus"

import CommentsController from "~/controllers/comments_controller"
import RUMController from "~/controllers/rum_controller"

pushr.init()
const application = Application.start()
application.register("comments", CommentsController)
application.register("rum", RUMController)
