import * as path from "path";
import { buildManifest, Manifest } from "../manifest.js";
import { md5 } from "../md5.js";

export default function generateEdgeLambdaEntry(options: {
  manifest: Manifest;
  route: Manifest["routes"][number];
}) {
  const basePath = path.resolve(process.cwd(), "routes");

  const matchingLayouts = options.manifest.layouts.filter((layout) =>
    options.route.path.startsWith(layout)
  );

  const layoutImports = matchingLayouts.map(
    (layout) => `
      import * as ${layoutName(layout)} from "${path.resolve(
      basePath,
      layout.slice(1),
      "layout.ts"
    )}";`
  );

  return `
    import { routeHandler } from "pocket/dist/vercel/route-handler";
    import * as route from "${path.resolve(
      basePath,
      options.route.path.slice(1),
      "route.ts"
    )}";
    ${layoutImports}

    export default function handler(req) {
        return routeHandler({
            path: ${JSON.stringify(options.route.path)},
            methods: route,
            css: ${JSON.stringify(options.route.css)},
            client: ${JSON.stringify(options.route.client)},
            layouts: [
            ${matchingLayouts.reverse().map(
              (layout) =>
                `{
                    path: ${JSON.stringify(layout)},
                    layout: ${layoutName(layout)},
                    pathDigest: "${md5(layout).slice(-6)}"
                  }`
            )}
            ]
        }, req)
    }
  `;
}

function layoutName(layout: string) {
  return layout.replaceAll("/", "_") + "Layout";
}
