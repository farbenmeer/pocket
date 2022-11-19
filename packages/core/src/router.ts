import * as fs from "fs/promises";
import * as path from "path";

export async function generateRouter(options: { server: boolean }) {
  const basePath = path.resolve(process.cwd(), "routes");
  const routes: string[] = [];

  async function parseDirectory(dir: string) {
    const entries = await fs.readdir(path.resolve(basePath, dir));

    for (const entry of entries) {
      if (entry === "route.ts") {
        routes.push(dir);
        return;
      }

      if ((await fs.stat(path.resolve(basePath, dir, entry))).isDirectory()) {
        await parseDirectory(dir + "/" + entry);
      }
    }
  }

  await parseDirectory(".");

  const imports = routes.map(
    (route) => `
    import * as ${handlerName(route)} from "./routes${route.slice(
      1
    )}/route.ts";`
  );

  const handlers = routes.map(
    (route) => `
    if ("${route === "" ? "/" : route}" === url.pathname) {
        return ${handlerName(route)}.get(req);
    }`
  );

  const registerWorkerCode = `
  (() => {
    if (typeof window !== "undefined" && "serviceWorker" in window.navigator) {
        window.navigator.serviceWorker.register("/_pocket-worker.js", {
          scope: "/",
        });
    }
  })();
  `;

  return `
    ${imports.join("\n")}

    function router(req) {
        const url = new URL(req.url)
        
        console.log('handle', url.pathname)
        
        if (url.pathname === "/_pocket/register-worker.js") {
            return new Response(${JSON.stringify(
              registerWorkerCode
            )}, { headers: { "Content-Type": "text/javascript" }})
        }

        ${
          options.server
            ? `
        if (url.pathname === "/_pocket-worker.js") {
            return new Response(${JSON.stringify(
              await fs.readFile(".pocket/worker/main.js", { encoding: "utf-8" })
            )}, { headers: { "Content-Type": "application/javascript; charset=UTF-8" }})
        }
        `
            : ""
        }

        ${handlers.join("\n")}

        return new Response("404", { status: 404, statusText: "Not Found" });
    }

    addEventListener('fetch', event => {
        return event.respondWith(router(event.request))
    })
  `;
}

function handlerName(route: string) {
  return route.replace(".", "index").replace("/", "_") + "Handler";
}
