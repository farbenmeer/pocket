import * as idb from "idb";
import { ResponseCookie } from "./cookies.js";
import { RuntimeManifest } from "./manifest.js";

interface PocketSchema extends idb.DBSchema {
  cookies: {
    key: string;
    value: ResponseCookie;
  };
  data: {
    key: "manifest";
    value: RuntimeManifest;
  };
}

let db: idb.IDBPDatabase<PocketSchema> | null = null;

export async function openDB() {
  db =
    db ??
    (await idb.openDB<PocketSchema>("_pocket", 2, {
      upgrade(db) {
        console.log("upgrade");
        db.createObjectStore("cookies", { keyPath: "name" });
        db.createObjectStore("data");
        console.log("upgrade done");
      },
    }));

  return db;
}
