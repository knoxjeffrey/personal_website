const fetch = require("node-fetch");

const {
  DEPLOY_ID,
  DEPLOY_PRIME_URL
} = process.env

module.exports = {
  onSuccess: () => {
    console.log(`${DEPLOY_PRIME_URL}/.netlify/functions/netlify_deploy_logger-background`)
    fetch(`${DEPLOY_PRIME_URL}/.netlify/functions/netlify_deploy_logger-background`, { 
      method: "POST",
      body: JSON.stringify(DEPLOY_ID)
    })
      .then(responseCheck => {
        if (!responseCheck.ok) { throw Error(responseCheck.status); }
      })
      .catch(error => {
        console.warn(error)
      });
  },
}
