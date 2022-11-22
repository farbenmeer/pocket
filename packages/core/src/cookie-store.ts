import { IncomingMessage, ServerResponse } from "http";
import { DBSchema, openDB } from "idb";

declare global {
  var cookieStore: any;
}

export type CookieOptions = {
  name: string;
  value: string;
  expires?: number;
  path?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  httpOnly?: boolean;
};

interface CookieStoreSchema extends DBSchema {
  cookies: {
    key: "cookies";
    value: CookieOptions[];
  };
}

interface StorageBackend {
  get(): CookieOptions[] | Promise<CookieOptions[]>;
  update(
    cb: (cookies: CookieOptions[]) => CookieOptions[]
  ): void | Promise<void>;
  path: string;
}

export class MemoryStorageBackend implements StorageBackend {
  private _storage: CookieOptions[];
  public readonly path: string;

  constructor(req: IncomingMessage, res: ServerResponse) {
    this._storage =
      req.headers.cookie?.split(";").map((cookie) => {
        const equalSignIndex = cookie.indexOf("=");
        return {
          name: cookie.slice(0, equalSignIndex).trim(),
          value: cookie.slice(equalSignIndex).trim(),
        };
      }) ?? [];

    this.path = req.url ? new URL(req.url).pathname : "/";
  }

  get() {
    return this._storage;
  }

  update(cb: (cookies: CookieOptions[]) => CookieOptions[]) {
    this._storage = cb(this._storage);
  }
}

class IdbStorageBackend implements StorageBackend {
  private _db = openDB<CookieStoreSchema>("_pocket-cookie-store", 1);
  path = "/";

  async get() {
    const db = await this._db;
    const cookies = await db.get("cookies", "cookies");
    return cookies ?? [];
  }

  async update(cb: (cookies: CookieOptions[]) => CookieOptions[]) {
    const db = await this._db;
    const tx = db.transaction("cookies", "readwrite");
    const cookies = (await tx.store.get("cookies")) ?? [];
    tx.store.put(cb(cookies), "cookies");
  }
}

function now() {
  return Math.floor(Date.now() / 1000);
}

function isActive(cookie: CookieOptions) {
  return !cookie.expires || cookie.expires > now();
}

class CookieStore {
  constructor(private _backend: StorageBackend) {}

  private matches(name: string, cookie: CookieOptions) {
    if (cookie.name !== name) {
      return false;
    }

    if (cookie.path && cookie.path !== this._backend.path) {
      return false;
    }

    return true;
  }

  private async getReduced() {
    const cookieMap = new Map<string, CookieOptions>();
    for (const cookie of await this._backend.get()) {
      const key = `${cookie.name};${cookie.path ?? this._backend.path}`;
      if (isActive(cookie)) {
        cookieMap.set(key, cookie);
      } else {
        cookieMap.delete(key);
      }
    }
    return Array.from(cookieMap.values());
  }

  async get(name: string) {
    const cookies = await this.getReduced();
    const cookie = cookies.find((cookie) => this.matches(name, cookie));

    if (!cookie) {
      return undefined;
    }
    if (!isActive(cookie)) {
      return undefined;
    }

    return cookie;
  }

  async getAll(name: string) {
    const cookies = await this.getReduced();

    if (!name) {
      return cookies;
    }

    return cookies.filter((cookie) => cookie.name === name);
  }

  async set(
    name: string,
    value: string,
    options: Omit<CookieOptions, "name" | "value"> & { maxAge?: number }
  ) {
    return this._backend.update((cookies) => [
      ...cookies,
      { ...options, name, value },
    ]);
  }

  async delete(name: string) {
    return this._backend.update((cookies) => [
      ...cookies,
      { name, value: "", expires: now() },
    ]);
  }
}

export const cookieStore = (() => {
  if (process.env.IS_SERVER) {
  }

  if (process.env.IS_WORKER) {
    if (typeof cookieStore !== "undefined") {
      return cookieStore;
    }
  }
})();
