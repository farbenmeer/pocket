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

  const handlers = routes.map(
    (route) => `
    if ("${route}" === url.pathname) {
      function getLayoutHtml() {
        return Promise.all([
          ${layouts
            .reverse()
            .map((layout) => {
              if (route.startsWith(layout)) {
                console.log("match layout", { route, layout });
                return `
                  ${layoutName(layout)}(req),
                `;
              }
              return "";
            })
            .join("")}
        ])
      }

      const preloadedLayoutHtml = req.headers.get("Accept").startsWith("text/html")
        ? getLayoutHtml()
        : null;

      let res = await ${handlerName(route)}.get(req);

      if (typeof res === "string") {
        res = new Html([""], [res])
      }

      if (res instanceof Html) {
        const layoutHtml = await (preloadedLayoutHtml ?? getLayoutHtml())
        const aggregatedHtml = layoutHtml.reduce((agg, layout) => layout.withChild(agg), res)
        res = new Response(aggregatedHtml.renderToStream(), { headers: { "Content-Type": "text/html" } })
      }

      return res
    }`
  );

  return {
    code: `
      import { Html, outlet } from "pocket"
      ${routeImports.join("\n")}
      ${layoutImports.join("\n")}

      async function router(req) {
          const url = new URL(req.url)

          console.log('handle', url.pathname)

          ${handlers.join("\n")}

          if (IS_SERVER) {
            return new Response("404 Not Found", { status: 404, statusText: "Not Found" });
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
function layoutName(layout: string) {
  return layout.replaceAll("/", "_") + "Layout";
}
