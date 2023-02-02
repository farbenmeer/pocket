import { RuntimeManifest } from "../manifest";
import { PocketRequest } from "../pocket-request";
import { notFound } from "../response-helpers";
import { handleRoute, RouteDefinition } from "../route-handler-common";
import { getRequestCookies, setResponseCookies } from "./cookies";

declare var _pocket: { manifest: RuntimeManifest };

export async function setupRouteHandler(routes: RouteDefinition[]) {
  addEventListener("fetch", async (evt_: Event) => {
    const evt = evt_ as FetchEvent;
    const req = new PocketRequest(evt.request, getRequestCookies(evt.request));
    const url = new URL(req.url);

    for (const route of routes) {
      console.debug("match", route.path, url.pathname);
      if (url.pathname !== route.path) {
        continue;
      }

      const res = await handleRoute(route, req, {
        css: _pocket.manifest.css,
      });

      setResponseCookies(res);

      res.headers.set("Server", "Pocket Server");
      console.log("retrrn", res.headers);
      evt.respondWith(res);
      return;
    }

    evt.respondWith(notFound({ headers: { Server: "Pocket Server" } }));
  });
}
