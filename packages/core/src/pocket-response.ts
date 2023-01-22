import { ResponseCookie, ResponseCookies } from "./cookies";
import { Html } from "./html";

export class PocketResponse extends Response {
  public cookies: ResponseCookies;

  constructor(
    body?: BodyInit | Html | null,
    init?: ResponseInit & { cookies?: ResponseCookie[] }
  ) {
    super(body instanceof Html ? body.renderToStream() : body, init);

    const headers =
      init?.headers instanceof Headers
        ? init.headers
        : new Headers(init?.headers);

    this.cookies = new ResponseCookies(headers);

    if (init?.cookies) {
      for (const cookie of init.cookies) {
        this.cookies.set(cookie);
      }
    }
  }
}
