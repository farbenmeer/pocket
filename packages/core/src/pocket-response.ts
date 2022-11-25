import * as EdgeRuntimeCookies from "@edge-runtime/cookies";
import { ResponseCookies } from "./cookies";
import { Html } from "./html";

export class PocketResponse extends Response {
  public cookies: ResponseCookies;

  constructor(body?: BodyInit | Html | null, init?: ResponseInit) {
    super(body instanceof Html ? null : body, init);

    const headers = this.headers;

    this.cookies = new EdgeRuntimeCookies.ResponseCookies(headers);
  }
}
