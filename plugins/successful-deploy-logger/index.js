const {
  BUILD_ID
} = process.env

module.exports = {
  onSuccess: () => {
    console.log(BUILD_ID)
  },
}
