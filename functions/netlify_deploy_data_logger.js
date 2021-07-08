import NetlifyAPI from "netlify"
import faunadb from "faunadb"

const {
  FAUNADB_SECRET,
  NETLIFY_API_TOKEN,
  SITE_ID
} = process.env

const prodHost = "www.jeffreyknox.dev"
const q = faunadb.query
const client = new faunadb.Client({
  secret: FAUNADB_SECRET
})

const netlifyDeploys = async () => {
  const client = new NetlifyAPI(NETLIFY_API_TOKEN)
  return await client.listSiteDeploys({ site_id: SITE_ID, page: 1, per_page: 1 })
}

const reducedDeploys = (deploys) => {
  return deploys.reduce((acc, deploy) => {
    if (deploy.state === "ready") {
      const { id, build_id, branch, context, deploy_time, created_at } = deploy
      return [...acc, { id, build_id, branch, context, deploy_time, created_at }]
    } else {
      return acc
    }
  }, [])
}

export async function handler(event, context) {
  const collectionName = event.headers.host === prodHost ? "NetlifyDeployData" : "NetlifyDeployData_Dev"

  let deploys = await netlifyDeploys()
  deploys = reducedDeploys(deploys)
  console.log(deploys)

  return client.query(
    q.Map(
      deploys,
      q.Lambda(
        "deploy_data",
        q.Create(
          q.Collection(collectionName),
          { data: q.Var("deploy_data") }
        )
      )
    )
  )
  .then((response) => {
    return { statusCode: 200 };
  }).catch((error) => {
    console.log("error", error)
  })
}
