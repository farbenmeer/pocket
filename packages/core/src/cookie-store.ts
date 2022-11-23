import { IncomingMessage, ServerResponse } from "http";
import { DBSchema, openDB } from "idb";
import { WorkerPostMessage } from "./post-message";

declare global {
  var cookieStore: any;
  var clients: Clients;
}

export type CookieOptions = {
  name: string;
  value: string;
  expires?: number;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  httpOnly?: boolean;
};

export interface CookieStore {
  get(name: string): Promise<CookieOptions | undefined>;
  set(
    name: string,
    value: string,
    options?: Omit<CookieOptions, "name" | "value">
  ): Promise<void>;
  getAll(): Promise<CookieOptions[]>;
  delete(name: string): Promise<void>;
}

export function parseCookie(cookie?: string | null): CookieOptions[] {
  return (
    cookie?.split(";").map((cookie) => {
      const equalSignIndex = cookie.indexOf("=");
      return {
        name: cookie.slice(0, equalSignIndex).trim(),
        value: decodeURIComponent(cookie.slice(equalSignIndex).trim()),
      };
    }) ?? []
  );
}

export function serializeCookie(cookieOptions: CookieOptions): string {
  let cookie = `${cookieOptions.name}=${encodeURIComponent(
    cookieOptions.value
  )};Path=/`;

  if (cookieOptions.expires) {
    cookie += `;Expires=${new Date(cookieOptions.expires).toUTCString()}`;
  }

  if (cookieOptions.sameSite) {
    cookie += `;SameSite=${cookieOptions.sameSite}`;
  }

  if (cookieOptions.secure) {
    cookie += ";Secure";
  }

  return cookie;
}

export class MemoryCookieStore implements CookieStore {
  private _original: CookieOptions[];
  private _changed: CookieOptions[] = [];

  constructor(cookie: string) {
    this._original = parseCookie(cookie);
  }

  get(name: string) {
    const cookieOptions =
      this._changed
        .reverse()
        .find((cookieOptions) => cookieOptions.name === name) ??
      this._original
        .reverse()
        .find((cookieOptions) => cookieOptions.name === name);

    if (!cookieOptions) {
      return Promise.resolve(undefined);
    }

    if (!isActive(cookieOptions)) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(cookieOptions);
  }

  getAll() {
    const cookieMap = new Map<string, CookieOptions>();
    for (const cookie of [...this._original, ...this._changed]) {
      if (isActive(cookie)) {
        cookieMap.set(cookie.name, cookie);
      } else {
        cookieMap.delete(cookie.name);
      }
    }
    return Promise.resolve(Array.from(cookieMap.values()));
  }

  set(
    name: string,
    value: string,
    options?: Omit<CookieOptions, "name" | "value">
  ) {
    this._changed.push({ ...options, name, value });
    return Promise.resolve();
  }

  delete(name: string) {
    this._changed.push({ name, value: "", expires: Date.now() });
    return Promise.resolve();
  }

  serialize(): string[] {
    const cookieMap = new Map(
      this._changed.map((cookieOptions) => [
        cookieOptions.name,
        serializeCookie(cookieOptions),
      ])
    );

    return Array.from(cookieMap.values());
  }
}

export class PostMessageCookieStore implements CookieStore {
  private _storage: Map<string, CookieOptions> | null = null;

  private async _getClient() {
    const allClients = await clients.matchAll();
    return allClients[0];
  }

  async init() {
    const client = await this._getClient();
    return new Promise<void>((resolve) => {
      const handleMessage = (event: MessageEvent<WorkerPostMessage>) => {
        switch (event.data.type) {
          case "return-cookies": {
            this._storage = new Map(
              parseCookie(event.data.cookie).map((cookieOptions) => [
                cookieOptions.name,
                cookieOptions,
              ])
            );
            resolve();
            break;
          }
        }
      };
      addEventListener("message", handleMessage, { once: true });
      client?.postMessage({ type: "get-cookies" });
    });
  }

  get(name: string) {
    if (!this._storage) {
      throw new Error("CookieStore was not initialized");
    }
    return Promise.resolve(this._storage.get(name));
  }

  async set(
    name: string,
    value: string,
    options?: Omit<CookieOptions, "name" | "value">
  ) {
    if (options?.httpOnly) {
      console.warn("Tried to set httpOnly cookie from a service worker");
      return;
    }
    if (!this._storage) {
      throw new Error("CookieStore was not initialized");
    }

    const cookieOptions = { ...options, name, value };
    this._storage.set(name, cookieOptions);

    const client = await this._getClient();
    client?.postMessage({
      type: "set-cookie",
      cookie: serializeCookie(cookieOptions),
    });
  }

  getAll() {
    if (!this._storage) {
      throw new Error("CookieStore was not initialized");
    }

    return Promise.resolve(Array.from(this._storage.values()));
  }

  async delete(name: string) {
    if (!this._storage) {
      throw new Error("CookieStore was not initialized");
    }

    this._storage.delete(name);
    const client = await this._getClient();
    client?.postMessage({
      type: "set-cookie",
      cookie: serializeCookie({ name, value: "", expires: Date.now() }),
    });
  }
}

function isActive(cookie: CookieOptions) {
  return !cookie.expires || cookie.expires > Date.now();
}

export const getBackend = Symbol("getBackend");
