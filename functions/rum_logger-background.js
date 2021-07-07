import { countryFromTimeZone } from "./utils/country_data"
import Bowser from "bowser"
import faunadb from "faunadb"
import shaJS from "sha.js"

const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

export async function handler(event, context) {
  console.log(process.env.CONTEXT)
  const collectionName = process.env.CONTEXT === "dev" ? "RealUserMetrics_Dev" : "RealUserMetrics"

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

  return client.query(
    q.Create(
      q.Collection(collectionName),
      { data: rumMetricsForAnalytics }
    )
  )
  .then((response) => {
    console.log("success")
    return { statusCode: 200 };
  }).catch((error) => {
    console.log("error", error)
  })
}
