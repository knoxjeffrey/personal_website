import { Application } from "stimulus"

import buildTimeByContextController from "~/controllers/dashboard/build_time_by_context_controller"
import meanBuildTimesController from "~/controllers/dashboard/mean_build_times_controller"
import monthsController from "~/controllers/dashboard/months_controller"
import successfulBuildsController from "~/controllers/dashboard/successful_builds_controller"
import yearsController from "~/controllers/dashboard/years_controller"

const application = Application.start()
application.register("build-time-by-context", buildTimeByContextController)
application.register("mean-build-times", meanBuildTimesController)
application.register("months", monthsController)
application.register("successful-builds", successfulBuildsController)
application.register("years", yearsController)
