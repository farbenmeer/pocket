import { codeBlock } from "common-tags";
import { EdgeRuntime, runServer } from "edge-runtime";
import * as fs from "fs";

export function getServerRuntime() {
  const serverCode = fs.readFileSync(".pocket/server/main.js", {
    encoding: "utf-8",
  });
  const runtime = new EdgeRuntime({
    initialCode: serverCode,
  });
  return runtime;
}

export function startServer() {
  runServer({ runtime: getServerRuntime(), port: 3000 });
}
