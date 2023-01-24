import webpack from "webpack";
import { webpackConfig } from "./webpack.config.js";

export async function build(options: { disableWorker: boolean }) {
  console.log("build it");
  await new Promise((resolve, reject) => {
    webpack(
      webpackConfig({
        mode: "production",
        disableWorker: options.disableWorker,
      }),
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
