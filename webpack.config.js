const glob = require("glob");
const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
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
            new ESBuildMinifyPlugin({
              target: "es2015",
              css: true
            })
          ]
        }
      }
    })(),

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "esbuild-loader",
          options: {
            target: "es2015"
          }
        },
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
