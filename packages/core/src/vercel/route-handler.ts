import { RuntimeManifest } from "../manifest";
import { PocketRequest } from "../pocket-request";
import { handleRoute, RouteDefinition } from "../route-handler-common";
import { getRequestCookies, setResponseCookies } from "../server/cookies";

export async function routeHandler(
  route: RouteDefinition,
  originalRequest: Request,
  manifest: RuntimeManifest
) {
  const req = new PocketRequest(
    originalRequest,
    getRequestCookies(originalRequest)
  );

  const res = await handleRoute(route, req, { css: manifest.css });

  setResponseCookies(res);

  res.headers.set("server", "Pocket Vercel Edge");

  return res;
}
