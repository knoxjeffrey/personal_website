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
  
  if (functionRequested == "netlify_deploy_data_years_and_months") {
    const { data, error } = await supabase
      .rpc("netlify_deploy_data_years_and_months")
    if (error) return { statusCode: 500, body: `An error occurred: ${JSON.stringify(error)}` }
    console.log(data)
    const yearsAndMonths = data[0].netlify_deploy_data_years_and_months
    return { statusCode: 200, body: JSON.stringify(yearsAndMonths) }
  }
}
