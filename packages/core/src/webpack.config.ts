import * as path from "path";
import { Configuration, DefinePlugin } from "webpack";
import CopyPlugin from "copy-webpack-plugin";

export function webpackConfig(options: {
  mode: Configuration["mode"];
  disableWorker?: boolean;
}): Configuration[] {
  const baseConfig = {
    mode: options.mode,
    context: path.resolve(process.cwd(), ".pocket"),
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/i,
          loader: "swc-loader",
          exclude: ["/node_modules/"],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
      modules: [process.cwd(), "node_modules"],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(process.cwd(), "public"),
            to: "static",
            noErrorOnMissing: true,
          },
        ],
      }),
      new DefinePlugin({
        "process.env.POCKET_DISABLE_WORKER": options.disableWorker === true,
      }),
    ],
  };

  const clientConfig: Configuration = {
    ...baseConfig,
    entry: {
      "_pocket-worker": "val-loader?environment=worker!pocket/dist/router.js",
      "_pocket/runtime": "pocket/dist/client/runtime.js",
    },
    output: {
      path: path.resolve(process.cwd(), ".pocket/static"),
      filename: "[name].js",
    },
    devtool: options.mode === "development" ? "eval-source-map" : "source-map",
    plugins: [
      ...baseConfig.plugins,
      new DefinePlugin({
        "process.env.POCKET_IS_WORKER": true,
        "process.env.POCKET_IS_SERVER": false,
      }),
    ],
  };

  const serverConfig: Configuration = {
    ...baseConfig,
    entry: "val-loader?environment=server!pocket/dist/router.js",
    output: {
      path: path.resolve(process.cwd(), ".pocket"),
      filename: "pocket-server.js",
    },
    devtool: "source-map",
    plugins: [
      ...baseConfig.plugins,
      new DefinePlugin({
        "process.env.POCKET_IS_WORKER": false,
        "process.env.POCKET_IS_SERVER": true,
      }),
    ],
  };

  return [clientConfig, serverConfig];
}
