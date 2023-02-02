import * as path from "path";
import { buildManifest } from "../manifest";
import { md5 } from "../md5";

export default function generateEdgeLambdaCode(options: { target: string }) {
  const basePath = path.resolve(process.cwd(), "routes");
  const manifest = buildManifest();

  const matchingLayouts = manifest.layouts.filter((layout) =>
    options.target.startsWith(layout)
  );

  const layoutImports = matchingLayouts.map(
    (layout) => `
      import * as ${layoutName(layout)} from "${path.resolve(
      basePath,
      layout.slice(1),
      "layout.ts"
    )}";`
  );

  return {
    code: `
            import { routeHandler } from "pocket/dist/vercel/route-handler";
            import * as route from "${path.resolve(
              basePath,
              options.target.slice(1),
              "route.ts"
            )}";
            ${layoutImports}
            import manifest from "./manifest.json"

            export default function handler(req) {
                return routeHandler({
                    path: ${JSON.stringify(options.target)},
                    methods: route,
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
                }, req, manifest)
            }
        `,
    dependencies: [
      path.resolve(basePath, options.target.slice(1), "route.ts"),
      ...matchingLayouts.map((layout) =>
        path.resolve(basePath, layout.slice(1), "layout.ts")
      ),
    ],
  };
}

function layoutName(layout: string) {
  return layout.replaceAll("/", "_") + "Layout";
}
