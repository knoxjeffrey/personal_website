require("dotenv").config()

const fetch = require("node-fetch")
const {
  FUNCTION_LOCALHOST
} = process.env

const getDummyDeploy = () => {
  return { 
    id: Math.random().toString(36).substr(2, 10),
    branch: sample(["main", "branch1", "branch2"]),
    context: sample(["production", "deploy-preview", "cms"]),
    deploy_time: randomIntFromInterval(25, 65),
    created_at: new Date().toISOString()
  }
}
const sample = arr => arr[Math.floor(Math.random() * arr.length)]
const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

namespace("seed", () => {
  // jake seed:development
  desc("Seed development")
  task("development", ["db:dump_production_schema", "netlify_deploy_data"], () => {
    console.log("Seed development datbase completed")
  })

   // jake seed:netlify_deploy_data
  desc("Seed netlify_deploy_data")
  task("netlify_deploy_data", async () => {
    for (const _ of [...Array(10)]) {
      const response = await fetch(`${FUNCTION_LOCALHOST}/.netlify/functions/deploy-succeeded-background`, { 
        method: "POST",
        body: JSON.stringify({ payload: getDummyDeploy() })
      })
      console.log(response.status)
    }
  })
})
