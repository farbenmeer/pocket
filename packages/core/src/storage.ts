import { DBSchema, openDB } from "idb";
import { CookieOptions } from "./cookie-store";

export interface PocketStorageSchema extends DBSchema {
  cookies: {
    key: "cookies";
    value: CookieOptions[];
  };
}

export const idb = openDB<PocketStorageSchema>("_pocket-internal", 1);
