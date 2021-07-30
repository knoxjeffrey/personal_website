import { createClient } from "@supabase/supabase-js"

const {
  CONTEXT,
  SUPABASE_ANON_KEY,
  SUPABASE_URL
} = process.env

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const buildContext = (branch, context) => {
  if (context === "production") return context
  return (branch.startsWith("cms/") ? "cms" : context)
}

const getDummyDeploy = () => {
  return { 
    deploy_id: Math.random().toString(36).substr(2, 10),
    branch: sample(["main", "branch1", "branch2"]),
    context: sample(["production", "deploy-preview", "cms"]),
    deploy_time: randomIntFromInterval(25, 65),
    created_at: new Date().toISOString()
  }
}

const sample = arr => arr[Math.floor(Math.random() * arr.length)]
const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

export async function handler(event, _context) {
  let dataToInsert = {}
  
  if (CONTEXT === "dev") {
    dataToInsert = getDummyDeploy()
  } else {
    const payload = JSON.parse(event.body).payload
    const { id, branch, context, deploy_time, created_at } = payload

    dataToInsert = {
      deploy_id: id,
      branch,
      context: buildContext(branch, context),
      deploy_time,
      created_at
    }
  }

  const { data, error } = await supabase
    .from("netlify_deploy_data")
    .insert([dataToInsert])
  
  if (error) return console.log("error", error)
}
