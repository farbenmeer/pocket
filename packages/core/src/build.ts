import webpack from "webpack";
import { webpackConfig } from "./webpack.config.js";

export async function build() {
  console.log("build it");
  process.env.NODE_ENV = "production";
  await new Promise((resolve, reject) => {
    webpack(webpackConfig(), (error, stats) => {
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
}
