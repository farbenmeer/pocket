import postcssrc from "postcss-load-config";
import { Manifest } from "./manifest.js";
import * as esbuild from "esbuild";
import * as path from "path";
import * as fs from "fs";
import { generateClientEntry } from "./client/entry.js";
import stylePlugin from "esbuild-style-plugin";
import generateRouter from "./router.js";
import generateEdgeLambdaEntry from "./vercel/entry.js";

export function define(
  environment: "worker" | "server" | "edge" | "client",
  mode: "development" | "production",
  disableWorker: boolean
) {
  return {
    "process.env.POCKET_DISABLE_WORKER": disableWorker ? "true" : "false",
    "process.env.POCKET_IS_WORKER": environment === "worker" ? "true" : "false",
    "process.env.POCKET_IS_SERVER": environment === "server" ? "true" : "false",
    "process.env.POCKET_IS_EDGE": environment === "edge" ? "true" : "false",
    "process.env.POCKET_IS_CLIENT": environment === "client" ? "true" : "false",
    "process.env.NODE_ENV": JSON.stringify(mode),
  };
}

export async function clientBuildOptions(options: {
  manifest: Manifest;
  disableWorker: boolean;
  outdir: string;
  onStart?: () => Promise<void>;
  onEnd?: () => Promise<void>;
  mode: "production" | "development";
}): Promise<esbuild.BuildOptions> {
  let postcssConfig = undefined;
  try {
    postcssConfig = await postcssrc({ cwd: process.cwd() });
  } catch {}

  return {
    entryPoints: [
      { in: "pocket/dist/client/runtime.js", out: "_pocket/runtime" },
      ...options.manifest.routes.map((route) => ({
        in: `.pocket/tmp/client/${route.path.slice(1) || "index"}/entry.js`,
        out: `_pocket/client/${route.path.slice(1) || "index"}`,
      })),
    ],
    outdir: options.outdir,
    bundle: true,
    platform: "browser",
    target: "es6",
    minify: options.mode === "production",
    metafile: true,
    plugins: [
      {
        name: "pocket",
        setup(build) {
          build.onStart(async () => {
            await options.onStart?.();

            await fs.promises.mkdir(options.outdir, { recursive: true });

            await Promise.all(
              options.manifest.routes.map(async (route) => {
                const dir = path.resolve(
                  process.cwd(),
                  ".pocket/tmp/client",
                  route.path.slice(1) || "index"
                );

                await fs.promises.mkdir(dir, { recursive: true });
                await fs.promises.writeFile(
                  path.resolve(dir, "entry.js"),
                  generateClientEntry(options.manifest, route.path)
                );
              })
            );

            const publicPath = path.resolve(process.cwd(), "public");

            await fs.promises.rm(options.outdir, { recursive: true });
            if (fs.existsSync(publicPath)) {
              await fs.promises.cp(publicPath, options.outdir, {
                recursive: true,
              });
            }
          });

          build.onDispose(async () => {
            await fs.promises.rm(".pocket/tmp/client", { recursive: true });
          });

          build.onEnd(async (result) => {
            for (const output of Object.values(result.metafile!.outputs)) {
              const entryPoint = output.entryPoint;
              if (!entryPoint) {
                continue;
              }

              const route = options.manifest.routes.find(
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
            await options.onEnd?.();
          });
        },
      },
      stylePlugin({
        postcss: postcssConfig,
      }),
    ],
    define: define("client", options.mode, options.disableWorker),
  };
}

export async function workerBuildOptions(options: {
  manifest: Manifest;
  disableWorker: boolean;
  outdir: string;
  mode: "production" | "development";
}): Promise<esbuild.BuildOptions> {
  return {
    entryPoints: {
      "_pocket-worker": ".pocket/tmp/worker/entry.js",
    },
    outdir: options.outdir,
    bundle: true,
    minify: options.mode === "production",
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
                manifest: options.manifest,
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
    define: define("worker", options.mode, options.disableWorker),
  };
}

export async function serverBuildOptions(options: {
  manifest: Manifest;
  disableWorker: boolean;
  write?: boolean;
  onEnd?: (result: esbuild.BuildResult) => Promise<void>;
  mode: "production" | "development";
  outdir: string;
}): Promise<esbuild.BuildOptions> {
  return {
    entryPoints: {
      server: ".pocket/tmp/server/entry.js",
    },
    outdir: options.outdir,
    bundle: true,
    platform: "browser",
    write: options.write ?? true,
    minify: options.mode === "production",
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
                manifest: options.manifest,
              })
            );
          });

          build.onEnd(async (result) => {
            await options.onEnd?.(result);
          });

          build.onDispose(async () => {
            await fs.promises.rm(".pocket/tmp/server", { recursive: true });
          });
        },
      },
      stylePlugin({ extract: false }),
    ],
    define: define("server", options.mode, options.disableWorker),
  };
}

export async function edgeBuildOptions(options: {
  manifest: Manifest;
  disableWorker: boolean;
}): Promise<esbuild.BuildOptions> {
  return {
    entryPoints: options.manifest.routes.map((route) => ({
      in: `.pocket/tmp/edge/${route.path.slice(1) || "index"}/entry.js`,
      out: `${route.path.slice(1) || "index"}.func/index`,
    })),
    outdir: path.resolve(process.cwd(), ".vercel/output/functions"),
    bundle: true,
    format: "esm",
    platform: "browser",
    minify: true,
    plugins: [
      {
        name: "pocket",
        setup(build) {
          build.onStart(async () => {
            await Promise.all(
              options.manifest.routes.map(async (route) => {
                const dir = path.resolve(
                  process.cwd(),
                  ".pocket/tmp/edge",
                  route.path.slice(1) || "index"
                );

                await fs.promises.mkdir(dir, { recursive: true });

                await fs.promises.writeFile(
                  path.resolve(dir, "entry.js"),
                  generateEdgeLambdaEntry({
                    manifest: options.manifest,
                    route,
                  })
                );
              })
            );
          });

          build.onEnd(async () => {
            await fs.promises.writeFile(
              path.resolve(process.cwd(), ".vercel/output/config.json"),
              JSON.stringify({
                version: 3,
              })
            );

            await Promise.all(
              options.manifest.routes.map(async (route) => {
                fs.promises.writeFile(
                  path.resolve(
                    process.cwd(),
                    ".vercel/output/functions",
                    `${route.path.slice(1) || "index"}.func`,
                    ".vc-config.json"
                  ),
                  JSON.stringify({
                    runtime: "edge",
                    entrypoint: "index.js",
                  })
                );
              })
            );
          });

          build.onDispose(async () => {
            await fs.promises.rm(".pocket/tmp/edge", { recursive: true });
          });
        },
      },
      stylePlugin({ extract: false }),
    ],
    define: define("edge", "production", options.disableWorker),
  };
}
