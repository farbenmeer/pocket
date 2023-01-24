import CopyPlugin from "copy-webpack-plugin";
import * as fs from "fs";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import { Configuration, DefinePlugin } from "webpack";

export const jsLoaders = {
  test: /\.(js|ts)$/i,
  loader: "swc-loader",
  exclude: ["/node_modules/"],
};

const cssLoader = {
  loader: "css-loader",
  options: { modules: true, importLoaders: 1 },
};

function resolvePostcssConfig() {
  const configPath = path.resolve(process.cwd(), "postcss.config.js");
  if (fs.existsSync(configPath)) {
    return configPath;
  }

  return false;
}

const postcssLoader = {
  loader: "postcss-loader",
  options: {
    postcssOptions: {
      config: resolvePostcssConfig(),
    },
  },
};

export const cssLoadersProd = {
  test: /\.css$/i,
  use: [MiniCssExtractPlugin.loader, cssLoader, postcssLoader],
};

export const cssLoadersDev = {
  test: /\.css$/i,
  use: ["style-loader", cssLoader, postcssLoader],
};

export const cssLoadersServer = {
  test: /\.css$/i,
  use: [
    { loader: MiniCssExtractPlugin.loader, options: { emit: false } },
    cssLoader,
    postcssLoader,
  ],
};

export const resolve = {
  extensions: [".tsx", ".ts", ".jsx", ".js"],
  modules: [process.cwd(), "node_modules"],
};

type Options = {
  mode: "development" | "production";
  disableWorker: boolean;
  context: string;
};

export function definePlugin(
  environment: "worker" | "server" | "edge",
  disableWorker: boolean
) {
  return new DefinePlugin({
    "process.env.POCKET_DISABLE_WORKER": disableWorker,
    "process.env.POCKET_IS_WORKER": environment === "worker",
    "process.env.POCKET_IS_SERVER": environment === "server",
    "process.env.POCKET_IS_EDGE": environment === "edge",
  });
}

export function workerConfig(options: Options): Configuration {
  return {
    entry: {
      "_pocket-worker": "val-loader?environment=worker!pocket/dist/router.js",
      "_pocket/runtime": "pocket/dist/client/runtime.js",
    },
    output: {
      path: path.resolve(options.context, "static"),
      filename: "[name].js",
    },
    mode: options.mode,
    context: options.context,
    module: {
      rules: [
        jsLoaders,
        options.mode === "development" ? cssLoadersDev : cssLoadersProd,
      ],
    },
    resolve,
    devtool: options.mode === "development" ? "eval-source-map" : "source-map",
    plugins: [
      definePlugin("worker", options.disableWorker),
      ...(options.mode === "development"
        ? []
        : [new MiniCssExtractPlugin({ filename: "main.css", runtime: false })]),
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
}

export function serverConfig(options: Omit<Options, "context">): Configuration {
  return {
    entry: "val-loader?environment=server!pocket/dist/router.js",
    output: {
      path: path.resolve(process.cwd(), ".pocket"),
      filename: "pocket-server.js",
    },
    mode: options.mode,
    context: path.resolve(process.cwd(), ".pocket"),
    module: {
      rules: [jsLoaders, cssLoadersServer],
    },
    resolve,
    devtool: "source-map",
    plugins: [
      definePlugin("server", options.disableWorker),
      new MiniCssExtractPlugin(),
    ],
  };
}

export function edgeConfig(options: {
  entry: Configuration["entry"];
  disableWorker: boolean;
}): Configuration {
  return {
    entry: options.entry,
    mode: "production",
    context: path.resolve(process.cwd(), ".vercel/output"),
    output: {
      path: path.resolve(process.cwd(), ".vercel/output/functions"),
      filename: "[name].js",
      library: {
        type: "module",
      },
    },
    experiments: {
      outputModule: true,
    },
    module: {
      rules: [jsLoaders, cssLoadersServer],
    },
    resolve,
    devtool: "source-map",
    plugins: [
      definePlugin("edge", options.disableWorker),
      new MiniCssExtractPlugin(),
    ],
  };
}
