const {
  DEPLOY_ID
} = process.env

module.exports = {
  onSuccess: () => {
    console.log(DEPLOY_ID)
  },
}
