import * as EdgeRuntimeCookies from "@edge-runtime/cookies";
import { RequestCookies } from "./cookies";

export class PocketRequest extends Request {
  public cookies: RequestCookies;

  constructor(req: Request, cookie?: string | null) {
    super(req);

    const headers = req.headers;
    if (cookie) {
      headers.set("Cookie", cookie);
    }

    this.cookies = new EdgeRuntimeCookies.RequestCookies(headers);
  }
}
