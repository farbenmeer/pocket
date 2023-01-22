export interface RequestCookie {
  name: string;
  value: string;
}

export interface ResponseCookie {
  name: string;
  value: string;
  path: "/";
  httpOnly?: boolean;
  maxAge?: number;
  secure?: boolean;
  sameSite?: "none" | "lax" | "strict" | true | false;
  expires?: Date;
}

export function parseCookie(cookie?: string | null): RequestCookie[] {
  return (
    cookie?.split(";").map((cookie) => {
      const equalSignIndex = cookie.indexOf("=");
      return {
        name: cookie.slice(0, equalSignIndex).trim(),
        value: decodeURIComponent(cookie.slice(equalSignIndex + 1).trim()),
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
  } else {
    cookie += `;SameSite=Lax`;
  }

  if (cookieOptions.secure) {
    cookie += ";Secure";
  }

  if (cookieOptions.httpOnly) {
    cookie += `;HttpOnly`;
  }

  return cookie;
}

export class RequestCookies {
  private cookies: Map<string, RequestCookie>;
  constructor(cookies: RequestCookie[]) {
    this.cookies = new Map(cookies.map((cookie) => [cookie.name, cookie]));
  }

  get size() {
    return this.cookies.size;
  }

  get(name: string) {
    return this.cookies.get(name);
  }

  getAll(name?: string) {
    if (name) {
      const cookie = this.cookies.get(name);
      if (cookie) {
        return [cookie];
      } else {
        return [];
      }
    }

    return Array.from(this.cookies.values());
  }

  has(name: string) {
    return this.cookies.has(name);
  }

  set(name: string, value: string) {
    this.cookies.set(name, { name, value });
    return this;
  }

  delete(name: string): boolean;
  delete(names: string[]): boolean[];
  delete(nameOrNames: string | string[]): boolean | boolean[] {
    if (Array.isArray(nameOrNames)) {
      return nameOrNames.map((name) => this.cookies.delete(name));
    }
    return this.cookies.delete(nameOrNames);
  }

  clear() {
    this.cookies.clear();
    return this;
  }

  toString() {
    return Array.from(this.cookies.values())
      .map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`)
      .join(";");
  }
}

export class ResponseCookies {
  private cookies: ResponseCookie[];

  constructor(headers: Headers, cookies?: ResponseCookie[]) {
    this.cookies = parseCookie(headers.get("Set-Cookie")).map((cookie) => ({
      path: "/",
      ...cookie,
    }));

    if (cookies) {
      this.cookies.push(...cookies);
    }
  }

  get(name: string) {
    return this.cookies.reverse().find((cookie) => cookie.name === name);
  }

  getAll(name?: string): ResponseCookie[] {
    if (name) {
      const cookie = this.get(name);
      if (cookie) {
        return [cookie];
      } else {
        return [];
      }
    }

    const cookieMap = new Map();
    for (const cookie of this.cookies) {
      cookieMap.set(cookie.name, cookie);
    }
    return Array.from(cookieMap.values());
  }

  set(cookie: ResponseCookie): this;
  set(
    name: string,
    value: string,
    options: Omit<ResponseCookie, "name" | "value">
  ): this;
  set(
    nameOrOptions: string | ResponseCookie,
    value?: string,
    options?: Omit<ResponseCookie, "name" | "value">
  ) {
    if (typeof nameOrOptions === "object") {
      this.cookies.push(nameOrOptions);
      return this;
    }

    this.cookies.push({
      ...options,
      name: nameOrOptions,
      value: value!,
    } as ResponseCookie);
    return this;
  }

  delete(name: string, options: { path: "/" }) {
    this.cookies.push({
      name,
      value: "",
      maxAge: 0,
      ...options,
    });
    return this;
  }

  toString() {
    return this.getAll().map(serializeCookie).join(",");
  }
}
