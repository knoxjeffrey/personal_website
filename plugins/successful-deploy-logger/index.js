const {
  DEPLOY_ID
} = process.env

module.exports = {
  onSuccess: () => {
    fetch("/.netlify/functions/netlify_deploy_logger-background", { 
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
