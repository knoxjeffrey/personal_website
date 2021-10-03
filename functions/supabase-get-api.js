import { createClient } from "@supabase/supabase-js"

const {
  SUPABASE_ANON_KEY,
  SUPABASE_URL
} = process.env

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const dateRanges = (event) => {
  let { year, month } = event.queryStringParameters
  year = parseInt(year)
  month = parseInt(month)

  const ltYear = month === 12 ? year + 1 : year
  const ltMonth = month === 12 ? 1 : month + 1

  const gte = `${year}-${String(month).padStart(2, "0")}-01T00:00:00+00:00`
  const lt = `${ltYear}-${String(ltMonth).padStart(2, "0")}-01T00:00:00+00:00`

  return { gte, lt }
}

export async function handler(event, _context) {
  const functionRequested = event.headers["function-name"]
  if (!functionRequested || event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  
  if (functionRequested == "netlify_build_data_for_year_and_month") {
    const dates = dateRanges(event)

    const { data, error } = await supabase
      .from("netlify_deploy_data")
      .select()
      .gte("created_at", dates.gte)
      .lt("created_at", dates.lt)

    if (error) return { statusCode: 500, body: `An error occurred: ${JSON.stringify(error)}` }
    return { statusCode: 200, body: JSON.stringify(data) }
  }

  if (functionRequested == "vitals_data_for_year_and_month") {
    const batchSize = 1000
    let combinedBatches = []
    let counter = 0
    const dates = dateRanges(event)

    const query = async (counter) => {
      const { data, error, count } = await supabase
        .from("real_user_metrics")
        .select("path, time_stamp, metric, data_float", { count: "exact" })
        .in("metric", ["fid", "lcp", "cls"])
        .gte("time_stamp", dates.gte)
        .lt("time_stamp", dates.lt)
        .order("time_stamp")
        .range((batchSize * counter), batchSize * (counter + 1))

      if (error) return { statusCode: 500, body: `An error occurred: ${JSON.stringify(error)}` }
      
      combinedBatches = combinedBatches.concat(data)
      if (count/(counter + 1) * batchSize >= 1) await query(counter += 1)
    }
    await query(counter)

    const assignDateWithoutTime = combinedBatches.map((rumObject) => {
      return Object.assign(rumObject, { date: rumObject.time_stamp.split("T")[0] })
    })
    return { statusCode: 200, body: JSON.stringify(assignDateWithoutTime) }
  }
}
