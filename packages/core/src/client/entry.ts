import { CompilerManifest } from "../manifest.js";
import * as path from "path";

export function buildEntryPoint(manifest: CompilerManifest, route: string) {
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
        import { setupRuntime } from "pocket/src/client/runtime.js";
        ${layoutImports}
        import ${JSON.stringify(
          path.resolve(process.cwd(), "routes", route.slice(1), "route.js")
        )};

        setupRuntime()
  `;
}
