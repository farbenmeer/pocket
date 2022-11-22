import { createHandler, EdgeRuntime } from "edge-runtime";
import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import nodeStatic from "node-static";

export function getServerRuntime() {
  console.log("getServerRuntime");
  const code = fs.readFileSync(
    path.resolve(process.cwd(), ".pocket/pocket-server.js"),
    {
      encoding: "utf-8",
    }
  );
  console.log("create EdgeRuntime");
  const runtime = new EdgeRuntime({
    initialCode: code,
  });
  console.log("EdgeRuntime done");
  return runtime;
}

export function startServer() {
  const dynamicHandler = createHandler({ runtime: getServerRuntime() });
  const staticHandler = new nodeStatic.Server(
    path.resolve(process.cwd(), ".pocket/static")
  );

  const server = http.createServer(async (req, res) => {
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

    await dynamicHandler.handler(req, res);
  });

  server.listen(3000);

  return server;
}
