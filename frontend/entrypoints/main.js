import { pushrInit } from "~/javascripts/pushr"
import * as Turbo from "@hotwired/turbo"
import { Application } from "@hotwired/stimulus"

import CommentsController from "~/controllers/comments_controller"
import RUMController from "~/controllers/rum_controller"

pushrInit()
const application = Application.start()
application.register("comments", CommentsController)
application.register("rum", RUMController)
