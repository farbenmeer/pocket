import * as fs from "fs";
import * as path from "path";

export function buildConfig() {
  const config = {
    version: 3,
  };

  fs.writeFileSync(
    path.resolve(process.cwd(), ".vercel/output/config.json"),
    JSON.stringify(config)
  );
}
