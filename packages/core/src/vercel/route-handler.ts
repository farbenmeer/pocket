import { RuntimeManifest } from "../manifest.js";
import { PocketRequest } from "../pocket-request.js";
import { handleRoute, RouteDefinition } from "../route-handler-common.js";
import { getRequestCookies, setResponseCookies } from "../server/cookies.js";

export async function routeHandler(
  route: RouteDefinition,
  originalRequest: Request
) {
  const req = new PocketRequest(
    originalRequest,
    getRequestCookies(originalRequest)
  );

  const res = await handleRoute(route, req);

  setResponseCookies(res);

  res.headers.set("server", "Pocket Vercel Edge");

  return res;
}
