import { generateRouter } from "./router";
import * as fs from "fs/promises";
import webpackServerConfig from "../webpack/server.webpack.config";
import webpackWorkerConfig from "../webpack/worker.webpack.config";
import { webpack } from "webpack";
import { getServerRuntime } from "./server-runtime";
import { runServer } from "edge-runtime";
import { promisify } from "util";

describe("router", () => {
  it("routes", async () => {
    const workerCompiler = webpack(webpackWorkerConfig());
    const serverCompiler = webpack(webpackServerConfig());

    const code = await generateRouter({ server: false });
    await fs.writeFile(".pocket/worker-entry.js", code);
    await fs.cp("examples/todo/routes", ".pocket/routes", { recursive: true });
    const workerCompilationStats = await new Promise((resolve, reject) => {
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
        return resolve(stats);
      });
    });

    const serverCode = await generateRouter({ server: true });
    await fs.writeFile(".pocket/server-entry.js", serverCode);
    const serverCompilationStats = await new Promise((resolve, reject) => {
      webpack(webpackServerConfig(), (error, stats) => {
        if (error) {
          return reject(error);
        }

        if (stats?.hasErrors()) {
          const info = stats.toJson();
          console.error(info.errors);
          return reject(info.errors);
        }

        return resolve(stats);
      });
    });

    const runtime = getServerRuntime();
    const res = await runtime.dispatchFetch("http://pocket.test/");

    await res.waitUntil();

    console.log("responded", await res.text());
  });
});
