import fs from "fs/promises";

export async function generateRouter() {
  const basePath = "examples/todo/routes/";
  const routes: string[] = [];

  async function parseDirectory(path: string) {
    const entries = await fs.readdir(basePath + path);

    for (const entry of entries) {
      if (entry === "route.ts") {
        routes.push(path);
        return;
      }

      if ((await fs.stat(basePath + path + "/" + entry)).isDirectory()) {
        await parseDirectory(path + "/" + entry);
      }
    }
  }

  await parseDirectory("");

  const imports = routes.map(
    (route) => `
    import * as ${
      route === "" ? "index" : route.replace("/", "_")
    } from "./routes${route}/route.ts";`
  );

  const handlers = routes.map(
    (route) => `
    if ("${route === "" ? "/" : route}" === url.pathname) {
        return new Response(${
          route === "" ? "index" : route.replace("/", "_")
        }.get(req));
    }`
  );

  console.log({ routes, imports });
  return `
    ${imports.join("\n")}

    export default function router(req) {
        const url = new URL(req.url)
        const segments = url.pathname.split('/')

        ${handlers.join("\n")}
    }
  `;
}
