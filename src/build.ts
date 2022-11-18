import { generateRouter } from "./router";
import * as fs from "fs/promises";
import webpackServerConfig from "../webpack/server.webpack.config";
import webpackWorkerConfig from "../webpack/worker.webpack.config";
import { webpack } from "webpack";
import { getServerRuntime } from "./server-runtime";

export async function build() {
  const code = await generateRouter({ server: false });
  await fs.writeFile(".pocket/worker-entry.js", code);
  await fs.cp("examples/todo/routes", ".pocket/routes", { recursive: true });
  await new Promise((resolve, reject) => {
    webpack(webpackWorkerConfig(), (error, stats) => {
      console.log("compiled", error, stats?.hasErrors());

      if (error) {
        return reject(error);
      }

      if (stats?.hasErrors()) {
        const info = stats.toJson();
        console.error(info.errors);
        return reject(info.errors);
      }

      if (stats?.hasWarnings()) {
        const info = stats.toJson();
        console.warn(info.warnings);
      }
      return resolve(stats);
    });
  });

  const serverCode = await generateRouter({ server: true });
  await fs.writeFile(".pocket/server-entry.js", serverCode);
  await new Promise((resolve, reject) => {
    webpack(webpackServerConfig(), (error, stats) => {
      if (error) {
        return reject(error);
      }

      if (stats?.hasErrors()) {
        const info = stats.toJson();
        console.error(info.errors);
        return reject(info.errors);
      }
      if (stats?.hasWarnings()) {
        const info = stats.toJson();
        console.warn(info.warnings);
      }

      return resolve(stats);
    });
  });
}
