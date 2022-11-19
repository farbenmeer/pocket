// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: "./worker-entry.js",
  context: path.resolve(process.cwd(), ".pocket"),
  output: {
    path: path.resolve(process.cwd(), ".pocket/worker"),
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
};

module.exports = () => {
  //if (isProduction) {
  config.mode = "production";
  //} else {
  //config.mode = "development";
  //}
  return config;
};
