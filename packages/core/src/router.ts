import * as path from "path";
import { buildManifest, Manifest } from "./manifest.js";
import { md5 } from "./md5.js";

export default function generateRouter(options: {
  environment: "server" | "worker";
  manifest: Manifest;
}) {
  const basePath = path.resolve(process.cwd(), "routes");

  const routeImports = options.manifest.routes.map(
    (route) => `
    import * as ${handlerName(route.path)} from "${path.resolve(
      basePath,
      route.path.slice(1),
      "route.ts"
    )}";`
  );
  const layoutImports = options.manifest.layouts.map(
    (layout) => `
    import * as ${layoutName(layout)} from "${path.resolve(
      basePath,
      layout.slice(1),
      "layout.ts"
    )}";
    `
  );

  return `
      import { setupRouteHandler } from "pocket/dist/${
        options.environment
      }/route-handler";
      ${routeImports.join("\n")}
      ${layoutImports.join("\n")}

      setupRouteHandler([
        ${options.manifest.routes.map(
          (route) => `{
            path: ${JSON.stringify(route.path)},
            methods: ${handlerName(route.path)},
            css: ${JSON.stringify(route.css)},
            client: ${JSON.stringify(route.client)},
            layouts: [
              ${options.manifest.layouts
                .filter((layout) => route.path.startsWith(layout))
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

function handlerName(path: string) {
  return path.replaceAll("/", "_") + "Handler";
}
function layoutName(layout: string) {
  return layout.replaceAll("/", "_") + "Layout";
}
