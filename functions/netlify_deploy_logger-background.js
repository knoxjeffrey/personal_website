import NetlifyAPI from "netlify"
import faunadb from "faunadb"

const {
  FAUNADB_SECRET,
  NETLIFY_API_TOKEN,
  SITE_ID
} = process.env

const q = faunadb.query
const client = new faunadb.Client({
  secret: FAUNADB_SECRET
})

const getDeploy = async (deploy_id) => {
  const client = new NetlifyAPI(NETLIFY_API_TOKEN)
  return await client.getSiteDeploy({ site_id: SITE_ID, deploy_id })
}

export async function handler(event, _context) {
  const deploy = await getDeploy(event.body)
  const { id, build_id, branch, context, deploy_time, created_at } = deploy

  return client.query(
    q.Create(
      q.Collection("NetlifyDeployData"),
      { data: { id, build_id, branch, context, deploy_time, created_at } }
    )
  )
  .then((response) => {
    console.log(response)
    return { statusCode: response.status };
  }).catch((error) => {
    console.log("error", error)
  })
}
