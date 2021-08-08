import { createClient } from "@supabase/supabase-js"

const {
  SUPABASE_ANON_KEY,
  SUPABASE_URL
} = process.env

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function handler(event, _context) {
  const functionRequested = event.headers["function-name"]
  if (!functionRequested || event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  
  if (functionRequested == "netlify_build_data_for_year_and_month") {
    let { year, month } = event.queryStringParameters
    year = parseInt(year)
    month = parseInt(month)
    let ltYear, ltMonth

    if (month === "12" ) {
      ltYear = year + 1
      ltMonth = 1
    } else {
      ltYear = year
      ltMonth = month + 1
    }
    const gte = `${year}-0${month}-01T00:00:00+00:00`
    const lt = `${ltYear}-0${ltMonth}-01T00:00:00+00:00`

    const { data, error } = await supabase
      .from("netlify_deploy_data")
      .select()
      .gte("created_at", gte)
      .lt("created_at", lt)
    if (error) return { statusCode: 500, body: `An error occurred: ${JSON.stringify(error)}` }

    return { statusCode: 200, body: JSON.stringify(data) }
  }
}
