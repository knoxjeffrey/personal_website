const fetch = require("node-fetch");

const {
  DEPLOY_ID,
  DEPLOY_PRIME_URL,
  FUNCTION_SECRET
} = process.env

const callNetlifyDeloyLogger = async () => {
  const response = await fetch(`${DEPLOY_PRIME_URL}/.netlify/functions/netlify_deploy_logger-background`, { 
    method: "POST",
    body: JSON.stringify({ deploy_id: DEPLOY_ID, secret: FUNCTION_SECRET })
  })
  if (response.ok) return console.log("Success")
  console.log(response.status)
}

module.exports = {
  onSuccess: async () => {
    console.log("Calling Netlify deploy logger background function")
    await callNetlifyDeloyLogger();
  }
}
