const fetch = require("node-fetch");

const {
  DEPLOY_ID,
  DEPLOY_PRIME_URL
} = process.env

const callNetlifyDeloyLogger = async () => {
  const response = await fetch(`${DEPLOY_PRIME_URL}/.netlify/functions/netlify_deploy_logger-background`, { 
    method: "POST",
    body: DEPLOY_ID
  })
  if (response.ok) return console.log("Success")
  console.log(response.status)
}

module.exports = {
  onSuccess: async () => {
    console.log("Calling Netlify deploy logger background function")
    callNetlifyDeloyLogger();
  }
}
