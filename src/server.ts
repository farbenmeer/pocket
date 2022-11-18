import { EdgeRuntime } from "edge-runtime";
import * as fs from "fs";

export function serverRuntime() {
  const runtime = new EdgeRuntime({
    initialCode: fs.readFileSync("entry.js", { encoding: "utf-8" }),
  });
}
