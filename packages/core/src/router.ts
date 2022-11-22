import * as fs from "fs";
import * as path from "path";

export default function generateRouter() {
  const basePath = path.resolve(process.cwd(), "routes");
  const routes: string[] = [];
  const layouts: string[] = [];

  function parseDirectory(dir: string) {
    const entries = fs.readdirSync(path.resolve(basePath, dir));

    for (const entry of entries) {
      if (entry === "route.ts") {
        routes.push(dir === "." ? "/" : dir.slice(1));
        return;
      }

      if (entry === "layout.ts") {
        layouts.push(dir === "." ? "/" : dir.slice(1));
      }

      if (fs.statSync(path.resolve(basePath, dir, entry)).isDirectory()) {
        parseDirectory(dir + "/" + entry);
      }
    }
  }

  parseDirectory(".");

  const routeImports = routes.map(
    (route) => `
    import * as ${handlerName(route)} from "${path.resolve(
      basePath,
      route.slice(1),
      "route.ts"
    )}";`
  );
  const layoutImports = layouts.map(
    (layout) => `
    import { layout as ${layoutName(layout)} } from "${path.resolve(
      basePath,
      layout.slice(1),
      "layout.ts"
    )}";
    `
  );

  return {
    code: `
      import { notFound } from "pocket";
      import { routeHandler } from "pocket/dist/route-handler";
      ${routeImports.join("\n")}
      ${layoutImports.join("\n")}

      async function fetchHandler(event) {
        const res = await routeHandler([
          ${routes.map(
            (route) => `{
              path: ${JSON.stringify(route)},
              methods: ${handlerName(route)},
              layouts: [
                ${layouts
                  .filter((layout) => route.startsWith(layout))
                  .reverse()
                  .map((layout) => layoutName(layout))
                  .join(",")}
              ]
            }`
          )}
        ], event.request)

        if (res) {
          event.respondWith(res)
          return
        }

        event.respondWith(${
          process.env.POCKET_IS_SERVER ? "notFound()" : "fetch(event.request)"
        })
      }

      addEventListener('fetch', fetchHandler)
    `,
    dependencies: routes.map((route) =>
      path.resolve(basePath, route, "route.ts")
    ),
  };
}

function handlerName(route: string) {
  return route.replaceAll("/", "_") + "Handler";
}
function layoutName(layout: string) {
  return layout.replaceAll("/", "_") + "Layout";
}
