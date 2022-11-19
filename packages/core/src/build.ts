import { generateRouter } from "./router";
import * as fs from "fs/promises";
import webpackServerConfig from "../webpack/server.webpack.config";
import webpackWorkerConfig from "../webpack/worker.webpack.config";
import { webpack } from "webpack";
import { getServerRuntime } from "./server-runtime";
import * as path from "path";

export async function build() {
  const pocketDir = path.resolve(process.cwd(), ".pocket");
  const routesDir = path.resolve(process.cwd(), "routes");

  try {
    await fs.stat(pocketDir);
  } catch {
    await fs.mkdir(pocketDir);
  }
  const code = await generateRouter({ server: false });
  await fs.writeFile(path.resolve(pocketDir, "worker-entry.js"), code);
  await fs.cp(routesDir, path.resolve(pocketDir, "routes"), {
    recursive: true,
  });
  await new Promise((resolve, reject) => {
    webpack(webpackWorkerConfig(), (error, stats) => {
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
  await fs.writeFile(path.resolve(pocketDir, "server-entry.js"), serverCode);
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
