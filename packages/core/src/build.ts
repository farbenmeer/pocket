import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";
import { define } from "./compiler.js";
import generateRouter from "./router.js";
import { buildManifest } from "./manifest.js";
import { buildEntryPoint } from "./client/entry.js";
import stylePlugin from "esbuild-style-plugin";
import postcssrc from "postcss-load-config";

export async function build(options: { disableWorker: boolean }) {
  console.log("build it");
  const manifest = buildManifest();

  let postcssConfig = undefined;
  try {
    postcssConfig = await postcssrc({ cwd: process.cwd() });
  } catch {}

  const result = await esbuild.build({
    entryPoints: manifest.routes.map((route) => ({
      in: `.pocket/tmp/client/${route.slice(1) || "index"}/entry.js`,
      out: route.slice(1) || "index",
    })),
    outdir: path.resolve(process.cwd(), ".pocket/prod/static/_pocket/client"),
    bundle: true,
    platform: "browser",
    target: "es6",
    minify: true,
    metafile: true,
    plugins: [
      {
        name: "pocket",
        setup(build) {
          build.onStart(async () => {
            console.log("write entrypoints");
            await Promise.all(
              manifest.routes.map(async (route) => {
                const dir = path.resolve(
                  process.cwd(),
                  ".pocket/tmp/client",
                  route.slice(1) || "index"
                );

                await fs.promises.mkdir(dir, { recursive: true });
                await fs.promises.writeFile(
                  path.resolve(dir, "entry.js"),
                  buildEntryPoint(manifest, route)
                );
              })
            );
          });

          build.onDispose(async () => {
            await fs.promises.rmdir(".pocket/tmp/client");
          });
        },
      },
      stylePlugin({
        postcss: postcssConfig,
      }),
    ],
    define: define("client", options.disableWorker),
  });

  console.log(result.metafile.outputs);
  await esbuild.build({
    entryPoints: {
      "_pocket-worker": ".pocket/tmp/worker/entry.js",
    },
    outdir: path.resolve(process.cwd(), ".pocket/prod"),
    bundle: true,
    platform: "browser",
    plugins: [
      {
        name: "entry",
        setup(build) {
          build.onStart(async () => {
            await fs.promises.mkdir(".pocket/tmp/worker", { recursive: true });
            await fs.promises.writeFile(
              ".pocket/tmp/worker/entry.js",
              generateRouter({
                environment: "worker",
              })
            );
          });

          build.onDispose(async () => {
            await fs.promises.rmdir(".pocket/tmp/worker");
          });
        },
      },
      stylePlugin({ extract: false }),
    ],
    define: define("worker", options.disableWorker),
  });
}
