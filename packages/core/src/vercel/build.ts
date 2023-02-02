import * as fs from "fs";
import path from "path";
import { webpack } from "webpack";
import { buildManifest, RuntimeManifest } from "../manifest";
import { edgeConfig, workerConfig } from "../webpack.config";
import { buildConfig } from "./config";

export default async function buildForVercel(options: {
  disableWorker: boolean;
}) {
  console.log("buildForVercel");
  const manifest = buildManifest();

  const webpackConfig = [
    workerConfig({
      context: path.resolve(process.cwd(), ".vercel/output"),
      mode: "production",
      disableWorker: options.disableWorker,
    }),
    edgeConfig({
      disableWorker: options.disableWorker,
      entry: Object.fromEntries(
        manifest.routes.map((route) => [
          (route.slice(1) || "index") + ".func/index",
          `val-loader?target=${encodeURIComponent(
            route
          )}!pocket/dist/vercel/edge-lambda.js`,
        ])
      ),
    }),
  ];

  await new Promise((resolve, reject) => {
    webpack(webpackConfig, (error, stats) => {
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

      return resolve(stats);
    });
  });

  for (const route of manifest.routes) {
    const folder = path.resolve(
      process.cwd(),
      ".vercel/output/functions",
      `${route.slice(1) || "index"}.func`
    );
    fs.writeFileSync(
      path.resolve(folder, "vc-config.json"),
      JSON.stringify({
        runtime: "edge",
        entrypoint: "index.js",
      })
    );
    fs.copyFileSync(
      path.resolve(
        process.cwd(),
        ".vercel/output/static/_pocket/manifest.json"
      ),
      path.resolve(folder, "manifest.json")
    );
  }

  buildConfig();
}
