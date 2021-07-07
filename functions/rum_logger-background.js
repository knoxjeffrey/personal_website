import { countryFromTimeZone } from "./utils/country_data"
import Bowser from "bowser"
import faunadb from "faunadb"
import shaJS from "sha.js"

const prodHost = "www.jeffreyknox.dev"
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

export async function handler(event, context) {
  const collectionName = event.headers.host === prodHost ? "RealUserMetrics" : "RealUserMetrics_Dev"

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

  return client.query(
    q.Create(
      q.Collection(collectionName),
      { data: rumMetricsForAnalytics }
    )
  )
  .then((response) => {
    return { statusCode: 200 };
  }).catch((error) => {
    console.log("error", error)
  })
}
