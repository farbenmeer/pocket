import * as EdgeRuntimeCookies from "@edge-runtime/cookies";

export interface RequestCookies extends EdgeRuntimeCookies.RequestCookies {}
export interface ResponseCookies extends EdgeRuntimeCookies.ResponseCookies {}
export type RequestCookie = EdgeRuntimeCookies.RequestCookie;
export type ResponseCookie = EdgeRuntimeCookies.ResponseCookie;

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
