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
      main_css: path.resolve(__dirname, "./source/assets/stylesheets/main.css.scss"),
      components_css: glob.sync(path.resolve(__dirname, "./components/**/*.scss")),
      commento_css: path.resolve(__dirname, "./source/assets/stylesheets/commento.css.scss"),
      game_css: path.resolve(__dirname, "./source/assets/stylesheets/game.css.scss")
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
          // Each module.id is incremented based on resolving order by default. Meaning when the order of resolving
          // is changed, the IDs will be changed as well. Adding a new js file for example will change the order.
          // Module ids by default are referenced by their numberic id which can cause changes in the minified
          // code of many files even though the original code has only changed in one place. Using "hashed"
          // creates a hashed module reference based on the filename which prevents the order id issue. This is
          // much better for caching on the website.
          moduleIds: "hashed"
        }
      }
    })(),

    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
            "sass-loader",
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
