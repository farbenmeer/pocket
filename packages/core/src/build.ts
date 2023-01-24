import webpack from "webpack";
import { serverConfig, workerConfig } from "./webpack.config.js";
import * as path from "path";

export async function build(options: { disableWorker: boolean }) {
  console.log("build it");
  await new Promise((resolve, reject) => {
    webpack(
      [
        workerConfig({
          mode: "production",
          disableWorker: options.disableWorker,
          context: path.resolve(process.cwd(), ".pocket"),
        }),
        serverConfig({
          mode: "production",
          disableWorker: options.disableWorker,
        }),
      ],
      (error, stats) => {
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
      }
    );
  });
}
