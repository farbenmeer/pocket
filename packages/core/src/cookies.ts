import * as EdgeRuntimeCookies from "@edge-runtime/cookies";
import { ClientPostMessage, WorkerPostMessage } from "./post-message";

export interface RequestCookies extends EdgeRuntimeCookies.RequestCookies {}
export interface ResponseCookies extends EdgeRuntimeCookies.ResponseCookies {}
export type RequestCookie = EdgeRuntimeCookies.RequestCookie;
export type ResponseCookie = EdgeRuntimeCookies.ResponseCookie;

export async function getCookiesFromClient(client: Client): Promise<string> {
  const cookies = new Promise<string>((resolve) => {
    function returnHandler(evt: MessageEvent<WorkerPostMessage>) {
      switch (evt.data.type) {
        case "return-cookies":
          resolve(evt.data.cookie);
          removeEventListener("message", returnHandler);
      }
    }

    addEventListener("message", returnHandler);

    const message: ClientPostMessage = {
      type: "get-cookies",
    };
    client.postMessage(message);
  });

  const timeout = new Promise<string>((_, reject) => {
    setTimeout(() => reject(new Error("Client did not return cookies")), 1000);
  });

  return Promise.race([cookies, timeout]);
}

export function setCookiesOnClient(client: Client, cookie: string) {
  const message: ClientPostMessage = {
    type: "set-cookie",
    cookie,
  };
  client.postMessage(message);
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
