module.exports = {
  plugins: [
    require("postcss-import-ext-glob"),
    require("postcss-import"),
    require("postcss-preset-env")({
      browsers: "last 2 versions",
    })
  ]
}
