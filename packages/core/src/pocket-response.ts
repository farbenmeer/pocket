import * as EdgeRuntimeCookies from "@edge-runtime/cookies";
import { ResponseCookies } from "./cookies";
import { Html } from "./html";

export class PocketResponse extends Response {
  public cookies: ResponseCookies;

  constructor(body?: BodyInit | Html | null, init?: ResponseInit) {
    super(body instanceof Html ? body.renderToStream() : body, init);

    const headers = this.headers;

    if (process.env.POCKET_IS_WORKER) {
      this.cookies = new EdgeRuntimeCookies.ResponseCookies(
        Object.assign(new Headers(headers), {
          getAll(name: string) {
            return [headers.get(name)].filter(Boolean);
          },
        })
      );
    } else {
      this.cookies = new EdgeRuntimeCookies.ResponseCookies(headers);
    }
  }
}
