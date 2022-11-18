import { generateRouter } from "./router";
import * as fs from "fs/promises";

describe("router", () => {
  it("routes", async () => {
    const code = await generateRouter();

    await fs.writeFile(".pocket/entry.js", code);
    await fs.cp("examples/todo/routes", ".pocket/routes", { recursive: true });
  });
});
