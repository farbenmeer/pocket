import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";
import { define } from "./compiler.js";
import generateRouter from "./router.js";
import { buildManifest } from "./manifest.js";
import { generateClientEntry } from "./client/entry.js";
import stylePlugin from "esbuild-style-plugin";
import postcssrc from "postcss-load-config";

export async function build(options: { disableWorker: boolean }) {
  console.log("build it");
  const manifest = buildManifest();

  let postcssConfig = undefined;
  try {
    postcssConfig = await postcssrc({ cwd: process.cwd() });
  } catch {}

  await esbuild.build({
    entryPoints: [
      { in: "pocket/dist/client/runtime.js", out: "runtime.js" },
      ...manifest.routes.map((route) => ({
        in: `.pocket/tmp/client/${route.path.slice(1) || "index"}/entry.js`,
        out: `client/${route.path.slice(1) || "index"}`,
      })),
    ],
    outdir: path.resolve(process.cwd(), ".pocket/prod/static/_pocket"),
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
                  route.path.slice(1) || "index"
                );

                await fs.promises.mkdir(dir, { recursive: true });
                await fs.promises.writeFile(
                  path.resolve(dir, "entry.js"),
                  generateClientEntry(manifest, route.path)
                );
              })
            );

            const publicPath = path.resolve(process.cwd(), "public");
            const staticPath = path.resolve(
              process.cwd(),
              ".pocket/prod/static"
            );

            if (fs.existsSync(publicPath)) {
              await fs.promises.cp(publicPath, staticPath, { recursive: true });
            } else {
              await fs.promises.rm(staticPath, { recursive: true });
            }
          });

          build.onDispose(async () => {
            await fs.promises.rm(".pocket/tmp/client", { recursive: true });
          });

          build.onEnd((result) => {
            for (const output of Object.values(result.metafile!.outputs)) {
              const entryPoint = output.entryPoint;
              if (!entryPoint) {
                continue;
              }

              const route = manifest.routes.find(
                (route) =>
                  entryPoint ===
                  `.pocket/tmp/client/${
                    route.path.slice(1) || "index"
                  }/entry.js`
              );

              if (!route) {
                continue;
              }

              route.css = output.cssBundle?.slice(19) ?? null;
            }
          });
        },
      },
      stylePlugin({
        postcss: postcssConfig,
      }),
    ],
    define: define("client", options.disableWorker),
  });

  await Promise.all([
    esbuild.build({
      entryPoints: {
        "_pocket-worker": ".pocket/tmp/worker/entry.js",
      },
      outdir: path.resolve(process.cwd(), ".pocket/prod/static"),
      bundle: true,
      platform: "browser",
      plugins: [
        {
          name: "entry",
          setup(build) {
            build.onStart(async () => {
              await fs.promises.mkdir(".pocket/tmp/worker", {
                recursive: true,
              });
              await fs.promises.writeFile(
                ".pocket/tmp/worker/entry.js",
                generateRouter({
                  environment: "worker",
                  manifest,
                })
              );
            });

            build.onDispose(async () => {
              await fs.promises.rm(".pocket/tmp/worker", { recursive: true });
            });
          },
        },
        stylePlugin({ extract: false }),
      ],
      define: define("worker", options.disableWorker),
    }),

    esbuild.build({
      entryPoints: {
        server: ".pocket/tmp/server/entry.js",
      },
      outdir: path.resolve(process.cwd(), ".pocket/prod"),
      bundle: true,
      platform: "browser",
      plugins: [
        {
          name: "pocket",
          setup(build) {
            build.onStart(async () => {
              await fs.promises.mkdir(".pocket/tmp/server", {
                recursive: true,
              });
              await fs.promises.writeFile(
                ".pocket/tmp/server/entry.js",
                generateRouter({
                  environment: "server",
                  manifest,
                })
              );
            });

            build.onDispose(async () => {
              await fs.promises.rm(".pocket/tmp/server", { recursive: true });
            });
          },
        },
        stylePlugin({ extract: false }),
      ],
      define: define("server", options.disableWorker),
    }),
  ]);
}
