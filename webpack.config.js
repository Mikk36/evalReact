const path = require("path");
const webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const nodeEnv = process.env.NODE_ENV || "development";
const isDev = nodeEnv !== "production";

const getPlugins = () => {
  const plugins = [];
  plugins.push(
      new webpack.LoaderOptionsPlugin({
        options: {
          sassLoader: {
            data: "@import \"styles/theme\";",
            includePaths: [path.resolve(__dirname, "./src/")]
          },
          postcss: [autoprefixer({browsers: ["last 2 versions"]})],
          context: "/", // Required for the sourceMap of css/sass loader
          debug: isDev,
          minimize: !isDev
        }
      }),
      new webpack.DefinePlugin({
        "process.env": {NODE_ENV: JSON.stringify(nodeEnv)},
        __DEV__: JSON.stringify(isDev)
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html"
      }),
      new webpack.NoErrorsPlugin(),
      new ExtractTextPlugin({filename: "[name].[hash].css", allChunks: true}),
      new webpack.optimize.CommonsChunkPlugin({
        names: ["main", "vendor"],
        filename: "[name].[hash].js",
        minChunks: module => /node_modules/.test(module.resource)
      })
  )
  ;

  if (isDev) {
    plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.IgnorePlugin(/webpack-stats\.json$/)
    );
  } else {
    plugins.push(
        new CleanWebpackPlugin(["dist", "build"], {
          verbose: true
        }),

        new webpack.optimize.UglifyJsPlugin({
          compress: {screw_ie8: true, warnings: false},
          output: {comments: false},
          sourceMap: true
        }),
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new webpack.optimize.DedupePlugin()
    );
  }

  return plugins;
};

const getEntry = () => {
  if (isDev) {
    return {
      app: [
        "webpack-dev-server/client?http://localhost:3000",
        "webpack/hot/dev-server",
        "./src/index"
      ]
    };
  } else {
    return {
      app: "./src/index"
    };
  }
};


module.exports = {
  stats: {children: false}, // hides the annoying "hidden-modules" spam when building
  cache: isDev,
  devtool: "source-map",
  context: path.join(__dirname, "/"),
  entry: getEntry(),
  output: {
    path: path.join(__dirname, "build"),
    publicPath: "/",
    filename: isDev ? "[name].[hash].js" : "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js"
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
    modules: [
      "src", // so we can do import "src/components/Link" instead of "../../../components/Link"
      "node_modules"
    ]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, "src"),
        loader: "babel-loader",
        query: {
          // cacheDirectory: isDev ? "babel" : null,
          presets: [[
            "latest", {
              "es2015": {
                "loose": true,
                "modules": false
              }
            }],
            "stage-0",
            "react"
          ],
          plugins: [
            "transform-decorators-legacy"
          ]
        }
      },
      {
        test: /\.json$/, loader: "json"
      },
      {
        test: /(\.scss|\.css)$/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: "style-loader",
          loader: [
            "css-loader?sourceMap&importLoaders=2&modules&localIdentName=[name]__[local]___[hash:base64:5]",
            "postcss-loader",
            "sass-loader?outputStyle=expanded&sourceMap&sourceMapContents"
          ].join("!")
        })
      },
      {test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff"},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream"},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file"},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml"}
    ]
  },
  plugins: getPlugins()
};
