import * as path from "path";
import { Configuration, DefinePlugin } from "webpack";

export const webpackConfig: () => Configuration[] = () => {
  const baseConfig = {
    entry: "val-loader!pocket/dist/router.js",
    mode: process.env.NODE_ENV as any,
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
    },
  };

  const workerConfig: Configuration = {
    ...baseConfig,
    output: {
      path: path.resolve(process.cwd(), ".pocket/static"),
      filename: "_pocket-worker.js",
    },
    plugins: [
      new DefinePlugin({
        IS_WORKER: true,
        IS_SERVER: false,
      }),
    ],
  };

  const serverConfig: Configuration = {
    ...baseConfig,
    output: {
      path: path.resolve(process.cwd(), ".pocket"),
      filename: "pocket-server.js",
    },
    plugins: [
      new DefinePlugin({
        IS_WORKER: false,
        IS_SERVER: true,
      }),
    ],
  };

  return [workerConfig, serverConfig];
};
