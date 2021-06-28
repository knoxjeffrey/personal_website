import * as Turbo from "@hotwired/turbo"
import { Application } from "stimulus"

import EPController from "./controllers/e_p_controller"
import HIPSController from "./controllers/h_i_p_s_controller"
import LTBLController from "./controllers/l_t_b_l_controller"
import MOTController from "./controllers/m_o_t_controller"
import MYMController from "./controllers/m_y_m_controller"
import RDController from "./controllers/r_d_controller"

const application = Application.start()
application.register("e-p", EPController)
application.register("h-i-p-s", HIPSController)
application.register("l-t-b-l", LTBLController)
application.register("m-o-t", MOTController)
application.register("m-y-m", MYMController)
application.register("r-d", RDController)
