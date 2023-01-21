import { parseCookie, ResponseCookie, serializeCookie } from "../cookies";
import { openDB } from "../db";

export async function syncCookies() {
  console.log("syncCookies");
  const db = await openDB();
  const cookies = parseCookie(document.cookie);
  const storedTs = await db.get("cookies", "_pocket_ts");
  if (!storedTs && cookies.length === 0) {
    // there are no cookies
    return;
  }
  const ts = cookies.find((cookie) => cookie.name === "_pocket_ts");
  async function writeToDb() {
    console.log("writeToDb");
    const tx = db.transaction("cookies", "readwrite");
    await tx.store.clear();
    for (const cookie of cookies) {
      console.log("write", cookie);
      await tx.store.put({ path: "/", ...cookie });
    }
    tx.commit();
  }
  async function writeToCookie() {
    console.log("writeToCookie");
    const storedCookies = await db.getAll("cookies");
    const storedCookieNames = new Set();
    for (const storedCookie of storedCookies) {
      console.log({ storedCookie });
      storedCookieNames.add(storedCookie.name);
      document.cookie = serializeCookie(storedCookie);
    }
    for (const cookie of cookies) {
      if (storedCookieNames.has(cookie.name)) {
        continue;
      }
      document.cookie = `${cookie.name}=;Max-Age=0`;
    }
  }
  if (!storedTs) {
    // indexedDB is empty, sync cookie -> indexedDB
    if (!ts) {
      // there is no timestamp yet, use current
      const ts: ResponseCookie = {
        name: "_pocket_ts",
        value: Math.floor(Date.now() / 1000).toString(),
        path: "/",
        maxAge: 34560000,
      };
      document.cookie = serializeCookie(ts);
      cookies.push(ts);
    }
    await writeToDb();
    return;
  }
  if (!ts) {
    // cookie does not have timestamp for some reason, sync indexedDB -> cookie
    await writeToCookie();
    return;
  }
  if (parseInt(ts.value) < parseInt(storedTs.value)) {
    console.log("cookie is older", ts.value, storedTs.value);
    // cookie is older than indexedDB, sync indexedDB -> cookie
    await writeToCookie();
    return;
  }
  // cookie is newer than indexedDB, sync cookie -> indexedDB
  await writeToDb();
}
