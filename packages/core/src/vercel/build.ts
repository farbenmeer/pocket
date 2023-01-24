import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import { Configuration, DefinePlugin, webpack } from "webpack";
import { buildManifest } from "../manifest";
import * as fs from "fs";
import { buildConfig } from "./config";

export default async function buildForVercel(options: {
  disableWorker: boolean;
}) {
  console.log("buildForVercel");
  const manifest = buildManifest();

  const baseConfig: Configuration = {
    mode: "production",
    context: path.resolve(process.cwd(), ".vercel/output"),
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/i,
          loader: "swc-loader",
          exclude: ["/node_modules"],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
      modules: [process.cwd(), "node_modules"],
    },
  };

  const clientConfig: Configuration = {
    ...baseConfig,
    entry: {
      "_pocket-worker": "val-loader?environment=worker!pocket/dist/router.js",
      "_pocket/runtime": "pocket/dist/client/runtime.js",
    },
    output: {
      path: path.resolve(process.cwd(), ".vercel/output/static"),
      filename: "[name].js",
    },
    devtool: "source-map",
    plugins: [
      new DefinePlugin({
        "process.env.POCKET_IS_WORKER": true,
        "process.env.POCKET_IS_SERVER": false,
        "process.env.POCKET_IS_EDGE": false,
        "process.env.POCKET_DISABLE_WORKER": options.disableWorker,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(process.cwd(), "public"),
            to: "static",
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
  };

  const edgeConfig: Configuration = {
    ...baseConfig,
    entry: Object.fromEntries(
      manifest.routes.map((route) => [
        (route.slice(1) || "index") + ".func/index",
        `val-loader?target=${encodeURIComponent(
          route
        )}!pocket/dist/vercel/edge-lambda.js`,
      ])
    ),
    experiments: {
      outputModule: true,
    },
    output: {
      path: path.resolve(process.cwd(), ".vercel/output/functions"),
      filename: "[name].js",
      library: {
        type: "module",
      },
    },
    devtool: "source-map",
    plugins: [
      new DefinePlugin({
        "process.env.POCKET_IS_WORKER": false,
        "process.env.POCKET_IS_SERVER": false,
        "process.env.POCKET_IS_EDGE": true,
        "process.env.POCKET_DISABLE_WORKER": options.disableWorker,
      }),
    ],
  };

  await new Promise((resolve, reject) => {
    webpack([clientConfig, edgeConfig], (error, stats) => {
      console.log("webpack is done");
      if (error) {
        console.error(error);
        return reject(error);
      }

      if (stats?.hasErrors()) {
        const info = stats.toJson("minimal");
        console.error(info.errors);
        return reject(info.errors);
      }

      if (stats?.hasWarnings()) {
        const info = stats.toJson();
        console.warn(info.warnings);
      }

      console.log(stats?.toJson("minimal"));
      return resolve(stats);
    });
  });

  for (const route of manifest.routes) {
    fs.writeFileSync(
      `${process.cwd()}/.vercel/output/functions/${
        route.slice(1) || "index"
      }.func/.vc-config.json`,
      JSON.stringify({
        runtime: "edge",
        entrypoint: "index.js",
      })
    );
  }

  buildConfig();
}
