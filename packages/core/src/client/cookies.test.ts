/**
 * @jest-environment jsdom
 */
import "fake-indexeddb/auto";
import { parseCookie } from "../cookies";
import { openDB } from "../db";
import { syncCookies } from "./cookies";

describe("cookie storage runtime", () => {
  let db: Awaited<ReturnType<typeof openDB>>;
  const now = { value: 1000 };
  Date.now = jest.fn(() => now.value);

  function tick() {
    now.value += 1000;
  }

  beforeAll(async () => {
    db = await openDB();
  });

  it("stores a cookie and timestamp if it finds one", async () => {
    document.cookie = "a=b";
    await syncCookies();

    const ts = parseCookie(document.cookie).find(
      (cookie) => cookie.name === "_pocket_ts"
    );

    expect(ts?.value).toBe("1");

    const storedTs = await db.get("cookies", "_pocket_ts");
    expect(storedTs?.value).toBe("1");

    const storedCookie = await db.get("cookies", "a");
    expect(storedCookie?.value).toBe("b");
  });

  it("writes from db to cookie when db is newer", async () => {
    document.cookie = "a=b";
    await syncCookies();

    tick();
    await db.put("cookies", {
      name: "a",
      value: "c",
      path: "/",
    });
    await db.put("cookies", {
      name: "_pocket_ts",
      value: "2",
      path: "/",
    });

    await syncCookies();

    const cookies = parseCookie(document.cookie);
    const ts = cookies.find((cookie) => cookie.name === "_pocket_ts");
    const a = cookies.find((cookie) => cookie.name === "a");

    expect(ts?.value).toBe("2");
    expect(a?.value).toBe("c");

    expect((await db.get("cookies", "_pocket_ts"))?.value).toBe("2");
    expect((await db.get("cookies", "a"))?.value).toBe("c");
  });
});
