import * as fs from "fs";
import path from "path";
import webpack from "webpack";
import { buildManifest, RuntimeManifest } from "../manifest.js";
import { edgeConfig, workerConfig } from "../webpack.config.js";
import { buildConfig } from "./config.js";

export default async function buildForVercel(options: {
  disableWorker: boolean;
}) {
  console.log("buildForVercel");
  const manifest = buildManifest();

  const runtimeManifest = await new Promise((resolve, reject) => {
    webpack.webpack(
      workerConfig({
        context: path.resolve(process.cwd(), ".vercel/output"),
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

        const chunks = stats?.toJson()?.chunks;

        if (!chunks) {
          return reject(
            new Error("Failed to retrieve compilation stats for chunks")
          );
        }

        const runtimeManifest: RuntimeManifest = {
          css: chunks[0]!.files?.some((file) => file.endsWith(".css")) ?? false,
        };

        fs.writeFileSync(
          path.resolve(
            process.cwd(),
            ".vercel/output/static/_pocket/manifest.json"
          ),
          JSON.stringify(runtimeManifest)
        );

        return resolve(runtimeManifest);
      }
    );
  });

  await new Promise((resolve, reject) => {
    webpack.webpack(
      edgeConfig({
        disableWorker: options.disableWorker,
        entry: Object.fromEntries(
          manifest.routes.map((route) => [
            (route.path.slice(1) || "index") + ".func/index",
            `val-loader?target=${encodeURIComponent(
              route.path
            )}!pocket/dist/vercel/edge-lambda.js`,
          ])
        ),
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

        return resolve(null);
      }
    );
  });

  for (const route of manifest.routes) {
    const folder = path.resolve(
      process.cwd(),
      ".vercel/output/functions",
      `${route.path.slice(1) || "index"}.func`
    );
    fs.writeFileSync(
      path.resolve(folder, ".vc-config.json"),
      JSON.stringify({
        runtime: "edge",
        entrypoint: "index.js",
      })
    );
  }

  buildConfig();
}
