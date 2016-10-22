const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const config = require("./webpack.config");

const compiler = webpack(config);

// We give notice in the terminal when it starts bundling
compiler.plugin("compile", () => {
  console.log("Bundling...");
});
let successCounter = 0;
compiler.plugin("done", stats => {
  stats.hasErrors() ? successCounter = 0 : successCounter += 1;
  console.log("Took", stats.endTime - stats.startTime, "ms - successes:", successCounter);
});

new WebpackDevServer(compiler, {
  publicPath: config.output.publicPath,
  // hot: true,
  historyApiFallback: true,
  noInfo: true,
  stats: {
    colors: true,
    version: false
  }
}).listen(3000, "0.0.0.0", err => {
  if (err) console.log(err);
  console.log("Listening at http://0.0.0.0:3000/");
});
