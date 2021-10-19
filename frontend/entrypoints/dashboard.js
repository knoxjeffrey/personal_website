import { Application } from "@hotwired/stimulus"

import coreVitalsSummaryController from "~/controllers/dashboard/core_vitals_summary_controller"
import dataVisualisationController from "~/controllers/dashboard/data_visualisation_controller"
import frameController from "~/controllers/dashboard/frame_controller"
import frameLoaderController from "~/controllers/dashboard/frame_loader_controller"
import histogramController from "~/controllers/dashboard/histogram_controller"
import meanBuildTimesController from "~/controllers/dashboard/mean_build_times_controller"
import monthsController from "~/controllers/dashboard/months_controller"
import selectContextController from "~/controllers/dashboard/select_context_controller"
import successfulBuildsController from "~/controllers/dashboard/successful_builds_controller"
import yearsController from "~/controllers/dashboard/years_controller"

const application = Application.start()
application.register("core-vitals-summary", coreVitalsSummaryController)
application.register("data-visualisation", dataVisualisationController)
application.register("frame", frameController)
application.register("frame-loader", frameLoaderController)
application.register("histogram", histogramController)
application.register("mean-build-times", meanBuildTimesController)
application.register("months", monthsController)
application.register("select-context", selectContextController)
application.register("successful-builds", successfulBuildsController)
application.register("years", yearsController)
