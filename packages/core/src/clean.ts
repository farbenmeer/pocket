import * as fs from "fs";
import * as path from "path";

export function clean() {
  const pocketDir = path.resolve(process.cwd(), ".pocket");
  if (fs.statSync(pocketDir).isDirectory()) {
    fs.rmSync(pocketDir, { recursive: true, force: true });
  }
}
