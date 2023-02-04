import * as path from "path";
import { buildManifest } from "./manifest.js";
import { md5 } from "./md5.js";

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

  return `
      import { setupRouteHandler } from "pocket/src/${
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
    `;
}

function handlerName(route: string) {
  return route.replaceAll("/", "_") + "Handler";
}
function layoutName(layout: string) {
  return layout.replaceAll("/", "_") + "Layout";
}
