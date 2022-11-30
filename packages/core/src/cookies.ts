import * as EdgeRuntimeCookies from "@edge-runtime/cookies";
import { db } from "./db";
import { ClientPostMessage, WorkerPostMessage } from "./post-message";

export interface RequestCookies extends EdgeRuntimeCookies.RequestCookies {}
export interface ResponseCookies extends EdgeRuntimeCookies.ResponseCookies {}
export type RequestCookie = EdgeRuntimeCookies.RequestCookie;
export type ResponseCookie = EdgeRuntimeCookies.ResponseCookie;

if (process.env.POCKET_IS_WORKER) {
  addEventListener("message", async (evt: MessageEvent<WorkerPostMessage>) => {
    console.log("worker got message", evt.data);
    switch (evt.data.type) {
      case "send-cookies":
        await (await db).put("cookies", evt.data.cookie, evt.data.path);
    }
  });
}

async function getClient(clientId: string): Promise<Client | undefined> {
  const clients = (self as any).clients as Clients;

  const allClients = await clients.matchAll({ type: "window" });

  return allClients[0];
}

export async function getCookies(url: URL): Promise<string> {
  return (await (await db).get("cookies", url.pathname)) ?? "";
}

export async function setCookies(clientId: string, url: URL, cookie: string) {
  console.log("set cookies", cookie);
  await (await db).put("cookies", cookie, url.pathname);

  const client = await getClient(clientId);
  if (client) {
    console.log("got client", client);
  }
  const message: ClientPostMessage = {
    type: "set-cookie",
    cookie,
  };
  client?.postMessage(message);
  console.log("set cookie done");
}

export function parseCookie(cookie?: string | null): RequestCookie[] {
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

export function serializeCookie(cookieOptions: ResponseCookie): string {
  let cookie = `${cookieOptions.name}=${encodeURIComponent(
    cookieOptions.value
  )}`;

  if (cookieOptions.path) {
    cookie += `;Path=${cookieOptions.path}`;
  }

  if (cookieOptions.expires) {
    cookie += `;Expires=${cookieOptions.expires.toUTCString()}`;
  }

  if (cookieOptions.maxAge) {
    cookie += `;MaxAge=${cookieOptions.maxAge}`;
  }

  if (cookieOptions.sameSite) {
    cookie += `;SameSite=${
      cookieOptions.sameSite === true ? "Strict" : cookieOptions.sameSite
    }`;
  }

  if (cookieOptions.secure) {
    cookie += ";Secure";
  }

  return cookie;
}
