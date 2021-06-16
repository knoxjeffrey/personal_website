import { countryFromTimeZone } from "./utils/country_data"
import Bowser from "bowser"
import shaJS from "sha.js"

export async function handler(event, context) {
  const rumMetrics = JSON.parse(event.body)
  const { identifier, timeZone, ...strippedRumMetrics } = rumMetrics;
  const browser = Bowser.parse(rumMetrics.userAgent);

  const rumMetricsForAnalytics = { 
    ...strippedRumMetrics,
    identifier: shaJS("sha256").update(`${rumMetrics.identifier}${rumMetrics.userAgent}`).digest("hex"),
    country: countryFromTimeZone(rumMetrics.timeZone),
    browserName: browser.browser.name,
    osName: browser.os.name,
    platformType: browser.platform.type
  }
  
  console.log(rumMetricsForAnalytics)
}
