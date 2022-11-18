import { build } from "./build";
import { getServerRuntime } from "./server-runtime";

describe("router", () => {
  it("routes", async () => {
    await build();

    const runtime = getServerRuntime();
    const res = await runtime.dispatchFetch("http://pocket.test/");

    await res.waitUntil();

    console.log("responded", await res.text());
  });
});
