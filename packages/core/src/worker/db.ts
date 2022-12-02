import { DBSchema, openDB } from "idb";
import { ResponseCookie } from "../cookies";

interface PocketSchema extends DBSchema {
  cookies: {
    key: string;
    value: ResponseCookie;
  };
}

console.log("initdb");
export const db = openDB<PocketSchema>("_pocket", 2, {
  upgrade(db) {
    console.log("upgrade");
    db.createObjectStore("cookies");
    console.log("upgrade done");
  },
});
console.log("initdb done");
