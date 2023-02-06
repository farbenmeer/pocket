import { Manifest } from "../manifest.js";
import * as path from "path";

export function generateClientEntry(manifest: Manifest, route: string) {
  const matchingLayouts = manifest.layouts.filter((layout) =>
    route.startsWith(layout)
  );

  const layoutImports = matchingLayouts.map(
    (layout) => `
      import ${JSON.stringify(
        path.resolve(process.cwd(), "routes", layout.slice(1), "layout.js")
      )};`
  );

  return `
    ${layoutImports}
    import ${JSON.stringify(
      path.resolve(process.cwd(), "routes", route.slice(1), "route.js")
    )};
  `;
}
