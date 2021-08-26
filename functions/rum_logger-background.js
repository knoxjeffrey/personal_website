import { createClient } from "@supabase/supabase-js"
import { countryFromTimeZone } from "./utils/country_data"
import Bowser from "bowser"
import shaJS from "sha.js"

const {
  CONTEXT,
  SUPABASE_ANON_KEY,
  SUPABASE_URL
} = process.env

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const prodHost = "www.jeffreyknox.dev"

export async function handler(event, context) {
  if (CONTEXT === "dev" || event.headers.host === prodHost) {
    const rumEventLogs = JSON.parse(event.body)

    const updatedRumEventLogs = rumEventLogs.map(log => {
      const { identifier, time_zone, ...strippedRumMetrics } = log;
      const browser = Bowser.parse(log.user_agent);

      return { 
        ...strippedRumMetrics,
        identifier: shaJS("sha256").update(`${log.identifier}${log.user_agent}`).digest("hex"),
        country: countryFromTimeZone(log.time_zone),
        browser_name: browser.browser.name,
        os_name: browser.os.name,
        platform_type: browser.platform.type
      }
    })

    const { data, error } = await supabase
      .from("real_user_metrics")
      .insert(updatedRumEventLogs)

    if (error) return console.log("error", error)
    return { statusCode: 200 }
  }
}
