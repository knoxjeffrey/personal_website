import Bowser from "bowser"

export async function handler(event, context) {
  const rumMetrics = JSON.parse(event.body)
  const browser = Bowser.parse(rumMetrics.userAgent);
  console.log(event)
  console.log(context)
  const rumMetricsUpdated = { 
    ...rumMetrics,
    browserName: browser.browser.name,
    osName: browser.os.name,
    platformType: browser.platform.type,
    sourceIp: event.requestContext.identity.sourceIp,
  }
  console.log(rumMetricsUpdated)
}
