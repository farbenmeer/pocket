import { createHandler } from "edge-runtime";
import * as esbuild from "esbuild";
import * as http from "http";
import nodeStatic from "node-static";
import * as path from "path";
import {
  clientBuildOptions,
  serverBuildOptions,
  workerBuildOptions,
} from "./compiler.js";
import { buildManifest } from "./manifest.js";
import { getServerRuntime } from "./server/start.js";

export async function startDevServer(options: {
  disableWorker: boolean;
  port: number;
}) {
  console.log("startDevServer");
  const manifest = buildManifest();

  const sharedState: SharedState = {
    dynamicHandler: null,
    rebuildCallbacks: new Set(),
    isRunning: false,
  };

  const clientCx = await esbuild.context(
    await clientBuildOptions({
      disableWorker: options.disableWorker,
      manifest,
      outdir: path.resolve(process.cwd(), ".pocket/dev/static"),
      mode: "development",

      async onStart() {
        Object.assign(manifest, buildManifest());
      },

      async onEnd() {
        await esbuild.build(
          await workerBuildOptions({
            disableWorker: options.disableWorker,
            manifest,
            outdir: path.resolve(process.cwd(), ".pocket/dev/static"),
            mode: "development",
          })
        );
        await esbuild.build(
          await serverBuildOptions({
            disableWorker: options.disableWorker,
            manifest,
            write: false,
            outdir: path.resolve(process.cwd(), ".pocket/dev"),
            mode: "development",

            async onEnd(result) {
              const code = result.outputFiles?.[0]?.text;
              if (!code) {
                throw new Error("Failed to retrieve server code from esbuild");
              }

              sharedState.dynamicHandler = createHandler({
                runtime: getServerRuntime({ code }),
              });
              if (sharedState.isRunning) {
                sharedState.rebuildCallbacks.forEach((cb) => cb());
                console.info("Rebuilt.");
              } else {
                console.info("Starting the dev server...");
                startServer({ port: options.port });
              }
            },
          })
        );
      },
    })
  );

  clientCx.watch();

  function startServer(options: { port: number }) {
    sharedState.isRunning = true;
    const staticHandler = new nodeStatic.Server(
      path.resolve(process.cwd(), ".pocket/dev/static"),
      { cache: false }
    );

    const server = http.createServer(async (req, res) => {
      console.log("handle", req.url);
      if (req.url === "/_pocket/dev-events") {
        console.log("setup dev events");
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
          Server: "Pocket Server",
        });

        function cb() {
          res.write("data: null\n\n");
        }

        sharedState.rebuildCallbacks.add(cb);

        req.on("close", () => {
          sharedState.rebuildCallbacks.delete(cb);
        });
        return;
      }

      const err = await new Promise((resolve) => {
        staticHandler.serve(req, res, (err) => {
          resolve(err);
        });
      });

      if (!err) {
        return;
      }

      if ((err as any).status !== 404) {
        throw err;
      }

      await sharedState.dynamicHandler!.handler(req, res);
    });

    server.listen(options.port);
    console.info(`Server started and listening on port ${options.port}.`);
  }
}

type EdgeRuntimeHandler = ReturnType<typeof createHandler>;
type SharedState = {
  dynamicHandler: EdgeRuntimeHandler | null;
  rebuildCallbacks: Set<() => void>;
  isRunning: boolean;
};
