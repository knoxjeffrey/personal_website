const glob = require("glob");
const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function (env) {
  const isProduction = env.production === true

  return {
    devServer: {
      // remove noise in browser console
      clientLogLevel: "silent",
      writeToDisk: true
    },

    entry: {
      main: path.resolve(__dirname, "./source/assets/javascripts/main.js"),
      components: glob.sync(path.resolve(__dirname, "./components/**/*.js")),
      game: path.resolve(__dirname, "./source/assets/javascripts/game/game.js"),
      main_css: path.resolve(__dirname, "./source/assets/stylesheets/main.css"),
      components_css: path.resolve(__dirname, "./source/assets/stylesheets/components.css"),
      commento_css: path.resolve(__dirname, "./source/assets/stylesheets/commento.css"),
      game_css: path.resolve(__dirname, "./source/assets/stylesheets/game.css")
    },

    output: {
      path: path.join(__dirname, "/.tmp/dist/compiled-assets"),
      filename: `[name].js`
    },

    plugins: [
      // Clean the output folder before build
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: `[name].css`
      })
    ],

    optimization: (() => {
      if (isProduction) {
        return {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              extractComments: true,
              terserOptions: {
                compress: {
                  pure_funcs: [
                    "console.log"
                  ]
                },
                output: {
                  comments: false
                }
              }
            })
          ],
          moduleIds: "deterministic"
        }
      }
    })(),

    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
        {
          test: /(\.css)$/,
          exclude: /node_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader"
          ],
        }
      ]
    },

    resolve: {
      fallback: {
        "crypto": false
      }
    }
  }
};
