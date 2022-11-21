import * as fs from "fs";
import * as path from "path";

export default function generateRouter() {
  const basePath = path.resolve(process.cwd(), "routes");
  const routes: string[] = [];

  function parseDirectory(dir: string) {
    const entries = fs.readdirSync(path.resolve(basePath, dir));

    for (const entry of entries) {
      if (entry === "route.ts") {
        routes.push(dir === "." ? "/" : dir.slice(1));
        return;
      }

      if (fs.statSync(path.resolve(basePath, dir, entry)).isDirectory()) {
        parseDirectory(dir + "/" + entry);
      }
    }
  }

  parseDirectory(".");

  const imports = routes.map(
    (route) => `
    import * as ${handlerName(route)} from "${path.resolve(
      basePath,
      route.slice(1),
      "route.ts"
    )}";`
  );

  const handlers = routes.map(
    (route) => `
    if ("${route}" === url.pathname) {
        return ${handlerName(route)}.get(req);
    }`
  );

  return {
    code: `
      ${imports.join("\n")}

      function router(req) {
          const url = new URL(req.url)

          console.log('handle', url.pathname)

          ${handlers.join("\n")}

          if (IS_SERVER) {
            return new Response("404", { status: 404, statusText: "Not Found" });
          } else {
            return fetch(req)
          }
      }

      addEventListener('fetch', event => {
          return event.respondWith(router(event.request))
      })
    `,
    dependencies: routes.map((route) =>
      path.resolve(basePath, route, "route.ts")
    ),
  };
}

function handlerName(route: string) {
  return route.replaceAll("/", "_") + "Handler";
}
