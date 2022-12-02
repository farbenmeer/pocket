import * as EdgeRuntimeCookies from "@edge-runtime/cookies";
import { RequestCookies, ResponseCookies, serializeCookie } from "../cookies";
import { PocketResponse } from "../pocket-response";

export function getRequestCookies(req: Request) {
  return new RequestCookies(
    new EdgeRuntimeCookies.RequestCookies(req.headers).getAll()
  );
}

export function setResponseCookies(res: Response) {
  if (res instanceof PocketResponse) {
    const cookies = new EdgeRuntimeCookies.ResponseCookies(res.headers);
    for (const cookie of res.cookies.getAll()) {
      cookies.set({ ...cookie, path: "/" });
    }
  }
}
