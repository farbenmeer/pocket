import { createHandler, EdgeRuntime } from "edge-runtime";
import * as fs from "fs";
import * as http from "http";
import nodeStatic from "node-static";
import * as path from "path";

export function getServerRuntime(options: { code: string } | { path: string }) {
  console.log("getServerRuntime");
  const code =
    "code" in options
      ? options.code
      : fs.readFileSync(options.path, {
          encoding: "utf-8",
        });

  console.log("create EdgeRuntime");
  const runtime = new EdgeRuntime({
    initialCode: code,
  });
  console.log("EdgeRuntime done");
  return runtime;
}

export function startServer(options: { port: number }) {
  console.log("startServer");
  const dynamicHandler = createHandler({
    runtime: getServerRuntime({
      path: path.resolve(process.cwd(), ".pocket/prod/server.js"),
    }),
  });
  console.log("create static handler");
  const staticHandler = new nodeStatic.Server(
    path.resolve(process.cwd(), ".pocket/prod/static")
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

  console.log("start now");
  server.listen(options.port, "localhost", () => {
    console.log("listening on", `http://localhost:${options.port}`);
  });

  return server;
}
