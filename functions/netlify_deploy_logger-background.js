import NetlifyAPI from "netlify"
import { createClient } from "@supabase/supabase-js"

const {
  FUNCTION_SECRET,
  NETLIFY_API_TOKEN,
  SITE_ID,
  SUPABASE_ANON_KEY,
  SUPABASE_URL
} = process.env

const prodHost = "www.jeffreyknox.dev"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const getDeploy = async (deploy_id) => {
  const client = new NetlifyAPI(NETLIFY_API_TOKEN)
  return await client.getSiteDeploy({ site_id: SITE_ID, deploy_id })
}

const getDummyDeploy = () => {
  return { 
    deploy_id: Math.random().toString(36).substr(2, 10),
    branch: sample(["main", "branch1", "branch2"]),
    context: sample(["production", "deploy-preview"]),
    deploy_time: randomIntFromInterval(25, 65),
    created_at: new Date().toISOString()
  }
}

const sample = arr => arr[Math.floor(Math.random() * arr.length)]
const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

export async function handler(event, _context) {
  let dataToInsert = {}

  if (event.headers.host === prodHost) {
    const payload = JSON.parse(event.body)
    if (payload.secret !== FUNCTION_SECRET) return console.log("Not Authorised")

    const deploy = await getDeploy(payload.deploy_id)
    const { id, branch, context, deploy_time, created_at } = deploy

    dataToInsert = { deploy_id: id, branch, context, deploy_time, created_at }
  } else {
    dataToInsert = getDummyDeploy()
  }
  

  const { data, error } = await supabase
    .from("netlify_deploy_data")
    .insert([dataToInsert])
  
  if (error) return console.log("error", error)
}
