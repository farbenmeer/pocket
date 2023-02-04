import { ResponseCookie } from "../cookies.js";
import { openDB } from "../db.js";

export async function getCookies(): Promise<ResponseCookie[]> {
  const db = await openDB();
  const cookies = await db.getAll("cookies");
  return cookies.filter((cookie) => !cookie.name.startsWith("_pocket"));
}

export async function setCookies(cookies: ResponseCookie[]) {
  console.log("set", cookies);
  if (cookies.length === 0) {
    return;
  }
  const db = await openDB();
  console.log("set cookies", cookies);
  const tx = db.transaction("cookies", "readwrite");
  for (const cookie of cookies) {
    await tx.store.put(cookie);
  }
  await tx.store.put({
    name: "_pocket_ts",
    value: Math.floor(Date.now() / 1000).toString(),
    path: "/",
    maxAge: 34560000,
  });
  tx.commit();
}
