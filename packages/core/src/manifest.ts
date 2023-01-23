import * as path from "path";
import * as fs from "fs";

export function buildManifest() {
  const basePath = path.resolve(process.cwd(), "routes");
  const routes: string[] = [];
  const layouts: string[] = [];

  function parseDirectory(dir: string) {
    const entries = fs.readdirSync(path.resolve(basePath, dir));
    console.log("parse", dir, entries);

    for (const entry of entries) {
      console.log("entry", entry);
      if (entry === "route.ts") {
        routes.push(dir === "." ? "/" : dir.slice(1));
        continue;
      }

      if (entry === "layout.ts") {
        layouts.push(dir === "." ? "/" : dir.slice(1));
        continue;
      }

      console.log(
        entry,
        "isDirectory",
        fs.statSync(path.resolve(basePath, dir, entry)).isDirectory()
      );
      if (fs.statSync(path.resolve(basePath, dir, entry)).isDirectory()) {
        parseDirectory(dir + "/" + entry);
      }
    }
  }

  parseDirectory(".");

  return {
    routes,
    layouts,
  };
}
