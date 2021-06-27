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
