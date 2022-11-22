import { createHandler } from "edge-runtime";
import * as http from "http";
import nodeStatic from "node-static";
import * as path from "path";
import { webpack } from "webpack";
import { getServerRuntime } from "./server.js";
import { webpackConfig } from "./webpack.config.js";

export function startDevServer(options?: { disableWorker?: boolean }) {
  console.log("startDevServer");
  const compiler = webpack(
    webpackConfig({
      mode: "development",
      disableWorker: options?.disableWorker,
    })
  );

  const sharedState: SharedState = {
    dynamicHandler: null,
    rebuildCallbacks: new Set(),
    isRunning: false,
  };

  compiler.watch({}, (error, stats) => {
    console.log("compiled", stats?.toJson("minimal"));
    if (error) {
      console.error(error);
      if (!sharedState.isRunning) {
        throw error;
      }
    }

    if (stats?.hasErrors()) {
      const info = stats.toJson("minimal");
      console.error(info.errors);
      if (!sharedState.isRunning) {
        throw new Error(JSON.stringify(info.errors));
      }
    }

    if (stats?.hasWarnings()) {
      const info = stats.toJson("minimal");
      console.warn(info.warnings);
    }

    console.log("create handler");
    sharedState.dynamicHandler = createHandler({ runtime: getServerRuntime() });
    console.log("handler created");
    if (sharedState.isRunning) {
      sharedState.rebuildCallbacks.forEach((cb) => cb());
    } else {
      console.log("start the server now");
      startServer();
    }
  });

  function startServer() {
    sharedState.isRunning = true;
    console.log("startServer");
    const staticHandler = new nodeStatic.Server(
      path.resolve(process.cwd(), ".pocket/static"),
      { cache: false }
    );

    const server = http.createServer(async (req, res) => {
      console.log("handle", req.method, req.url);
      if (req.url === "/_pocket/dev-events") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
          Server: "Pocket Server",
        });
        function cb() {
          console.log("send event");
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

    server.listen(3000);
  }
}

type EdgeRuntimeHandler = ReturnType<typeof createHandler>;
type SharedState = {
  dynamicHandler: EdgeRuntimeHandler | null;
  rebuildCallbacks: Set<() => void>;
  isRunning: boolean;
};
