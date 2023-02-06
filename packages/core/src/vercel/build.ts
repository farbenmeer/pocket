import * as esbuild from "esbuild";
import path from "path";
import {
  clientBuildOptions,
  edgeBuildOptions,
  workerBuildOptions,
} from "../compiler.js";
import { buildManifest } from "../manifest.js";

export default async function buildForVercel(options: {
  disableWorker: boolean;
}) {
  console.log("buildForVercel");
  const manifest = buildManifest();

  await esbuild.build(
    await clientBuildOptions({
      mode: "production",
      outdir: path.resolve(process.cwd(), ".vercel/output/static"),
      manifest,
      disableWorker: options.disableWorker,
    })
  );

  await Promise.all([
    esbuild.build(
      await workerBuildOptions({
        manifest,
        disableWorker: options.disableWorker,
        mode: "production",
        outdir: path.resolve(process.cwd(), ".vercel/output/static"),
      })
    ),
    esbuild.build(
      await edgeBuildOptions({
        manifest,
        disableWorker: options.disableWorker,
      })
    ),
  ]);
}
