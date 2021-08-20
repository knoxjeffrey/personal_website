import { countryFromTimeZone } from "./utils/country_data"
import Bowser from "bowser"
import shaJS from "sha.js"

const {
  CONTEXT
} = process.env

const prodHost = "www.jeffreyknox.dev"

export async function handler(event, context) {
  if (CONTEXT === "dev" || event.headers.host === prodHost) {
    const rumEventLogs = JSON.parse(event.body)

    const updatedRumEventLogs = rumEventLogs.map(log => {
      const { identifier, timeZone, ...strippedRumMetrics } = log;
      const browser = Bowser.parse(log.userAgent);

      return { 
        ...strippedRumMetrics,
        identifier: shaJS("sha256").update(`${log.identifier}${log.userAgent}`).digest("hex"),
        country: countryFromTimeZone(log.timeZone),
        browserName: browser.browser.name,
        osName: browser.os.name,
        platformType: browser.platform.type
      }
    })
    
    console.log(updatedRumEventLogs)
    return { statusCode: 200 }
  }
}
