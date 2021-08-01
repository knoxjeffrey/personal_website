import { createClient } from "@supabase/supabase-js"

const {
  SUPABASE_ANON_KEY,
  SUPABASE_URL
} = process.env

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const buildContext = (branch, context) => {
  if (context === "production") return context
  return (branch.startsWith("cms/") ? "cms" : context)
}

export async function handler(event, _context) {
  const payload = JSON.parse(event.body).payload
  const { id, branch, context, deploy_time, created_at } = payload

  const dataToInsert = {
    deploy_id: id,
    branch,
    context: buildContext(branch, context),
    deploy_time,
    created_at
  }

  const { data, error } = await supabase
    .from("netlify_deploy_data")
    .insert([dataToInsert])
  
  if (error) return console.log("error", error)
  return { statusCode: 200 }
}
