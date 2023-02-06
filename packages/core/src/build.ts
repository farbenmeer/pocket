import * as esbuild from "esbuild";
import path from "path";
import {
  clientBuildOptions,
  serverBuildOptions,
  workerBuildOptions,
} from "./compiler.js";
import { buildManifest } from "./manifest.js";

export async function build(options: { disableWorker: boolean }) {
  const manifest = buildManifest();

  await esbuild.build(
    await clientBuildOptions({
      manifest,
      disableWorker: options.disableWorker,
      outdir: path.resolve(process.cwd(), ".pocket/prod/static"),
      mode: "production",
    })
  );

  await Promise.all([
    esbuild.build(
      await workerBuildOptions({
        manifest,
        disableWorker: options.disableWorker,
        mode: "production",
        outdir: path.resolve(process.cwd(), ".pocket/prod/static"),
      })
    ),
    esbuild.build(
      await serverBuildOptions({
        manifest,
        disableWorker: options.disableWorker,
        outdir: path.resolve(process.cwd(), ".pocket/prod"),
        mode: "production",
      })
    ),
  ]);
}
