import { Html } from "../html";
import { PocketRequest } from "../pocket-request";
import { PocketResponse } from "../pocket-response";
import { notFound } from "../response-helpers";
import { handleRoute, RouteDefinition } from "../route-handler-common";
import { getRequestCookies, setResponseCookies } from "../server/cookies";

export async function routeHandler(
  route: RouteDefinition,
  originalRequest: Request,
  options: { css: boolean }
) {
  const req = new PocketRequest(
    originalRequest,
    getRequestCookies(originalRequest)
  );

  const res = await handleRoute(route, req, options);

  setResponseCookies(res);

  res.headers.set("server", "Pocket Vercel Edge");

  return res;
}
