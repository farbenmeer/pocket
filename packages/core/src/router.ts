import * as fs from "fs";
import * as path from "path";
import { md5 } from "./md5";

export default function generateRouter(options: {
  environment: "server" | "worker";
}) {
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
    import * as ${layoutName(layout)} from "${path.resolve(
      basePath,
      layout.slice(1),
      "layout.ts"
    )}";
    `
  );

  return {
    code: `
      import { setupRouteHandler } from "pocket/dist/${
        options.environment
      }/route-handler";
      ${routeImports.join("\n")}
      ${layoutImports.join("\n")}

      setupRouteHandler([
        ${routes.map(
          (route) => `{
            path: ${JSON.stringify(route)},
            methods: ${handlerName(route)},
            layouts: [
              ${layouts
                .filter((layout) => route.startsWith(layout))
                .reverse()
                .map(
                  (layout) =>
                    `{ path: "${layout}", layout: ${layoutName(
                      layout
                    )}.layout, pathDigest: "${md5(layout).slice(-6)}" }`
                )
                .join(",")}
            ]
          }`
        )}
      ])
    `,
    dependencies: routes
      .map((route) => path.resolve(basePath, route.slice(1), "route.ts"))
      .concat(
        layouts.map((layout) =>
          path.resolve(basePath, layout.slice(1), "layout.ts")
        )
      ),
  };
}

function handlerName(route: string) {
  return route.replaceAll("/", "_") + "Handler";
}
function layoutName(layout: string) {
  return layout.replaceAll("/", "_") + "Layout";
}
