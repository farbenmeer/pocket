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
    if (req.url === "/_pocket-runtime.js") {
      const runtimeCode = await getRuntimeCode();
      res.writeHead(200, undefined, {
        "Content-Type": "application/javascript",
      });
      res.end(runtimeCode);
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

    await dynamicHandler.handler(req, res);
  });

  server.listen(3001);

  return server;
}

let runtimeCode: Promise<string> | null = null;
export async function getRuntimeCode() {
  if (runtimeCode) {
    return runtimeCode;
  }
  runtimeCode = fs.promises.readFile(
    require.resolve("pocket/dist/runtime.js"),
    {
      encoding: "utf-8",
    }
  );
  return runtimeCode;
}
