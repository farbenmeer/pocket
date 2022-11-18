import fs from "fs/promises";

export async function generateRouter(options: { server: boolean }) {
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
        return ${route === "" ? "index" : route.replace("/", "_")}.get(req);
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

  console.log({ routes, imports });
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

// <script src="_pocket/worker.js"></script>
