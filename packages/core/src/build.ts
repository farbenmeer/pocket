import * as fs from "fs";
import * as path from "path";
import webpack from "webpack";
import { RuntimeManifest } from "./manifest.js";
import { serverConfig, workerConfig } from "./webpack.config.js";

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

        const chunks = stats?.toJson()?.children?.[0]?.chunks;

        if (!chunks) {
          return reject(
            new Error("Failed to retrieve compilation stats for chunks")
          );
        }

        const clientManifest: RuntimeManifest = {
          css: chunks[0]!.files?.some((file) => file.endsWith(".css")) ?? false,
        };

        fs.writeFileSync(
          path.resolve(process.cwd(), ".pocket/static/_pocket/manifest.json"),
          JSON.stringify(clientManifest)
        );

        return resolve(stats);
      }
    );
  });
}
