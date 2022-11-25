import * as EdgeRuntimeCookies from "@edge-runtime/cookies";
import { ResponseCookies } from "./cookies";
import { Html } from "./html";

export class PocketResponse extends Response {
  public cookies: ResponseCookies;
  public _htmlBody?: Html;

  constructor(body?: BodyInit | Html | null, init?: ResponseInit) {
    if (typeof body === "string") {
      super(null, init);
      this._htmlBody = new Html([body] as unknown as TemplateStringsArray, []);
    } else if (body instanceof Html) {
      super(null, init);
      this._htmlBody = body;
    } else {
      super(body, init);
    }

    const headers = this.headers;

    this.cookies = new EdgeRuntimeCookies.ResponseCookies(headers);
  }
}
