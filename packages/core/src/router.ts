import * as fs from "fs";
import * as path from "path";
import { buildManifest } from "./manifest";
import { md5 } from "./md5";

export default function generateRouter(options: {
  environment: "server" | "worker";
}) {
  const manifest = buildManifest();
  const basePath = path.resolve(process.cwd(), "routes");

  const routeImports = manifest.routes.map(
    (route) => `
    import * as ${handlerName(route)} from "${path.resolve(
      basePath,
      route.slice(1),
      "route.ts"
    )}";`
  );
  const layoutImports = manifest.layouts.map(
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
        ${manifest.routes.map(
          (route) => `{
            path: ${JSON.stringify(route)},
            methods: ${handlerName(route)},
            layouts: [
              ${manifest.layouts
                .filter((layout) => route.startsWith(layout))
                .reverse()
                .map(
                  (layout) =>
                    `{
                        path: ${JSON.stringify(layout)},
                        layout: ${layoutName(layout)},
                        pathDigest: "${md5(layout).slice(-6)}"
                      }`
                )
                .join(",")}
            ]
          }`
        )}
      ])
    `,
    dependencies: manifest.routes
      .map((route) => path.resolve(basePath, route.slice(1), "route.ts"))
      .concat(
        manifest.layouts.map((layout) =>
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
