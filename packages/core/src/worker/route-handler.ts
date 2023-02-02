import { ClientPostMessage } from "../client/post-message";
import { RequestCookies } from "../cookies";
import { openDB } from "../db";
import { PocketRequest } from "../pocket-request";
import { PocketResponse } from "../pocket-response";
import { handleRoute, RouteDefinition } from "../route-handler-common";
import { getCookies, setCookies } from "./cookies";

declare var clients: Clients;

const CACHE_NAME = "_pocket-internal";

export async function setupRouteHandler(routes: RouteDefinition[]) {
  console.log(routes);

  async function handleInstall() {
    const res = await fetch("/_pocket/manifest.json");
    const manifest = await res.json();
    const db = await openDB();
    db.put("data", manifest, "manifest");
  }

  async function handleFetch(evt: FetchEvent) {
    const url = new URL(evt.request.url);

    if (url.hostname !== location.hostname) {
      return fetch(evt.request);
    }

    const db = await openDB();
    const manifest = await db.get("data", "manifest");

    if (!manifest) {
      throw new Error("Failed to retrieve manifest");
    }

    for (const route of routes) {
      console.log("match", route.path, url.pathname);
      if (url.pathname !== route.path) {
        continue;
      }

      const requestCookies = await getCookies();

      const req = new PocketRequest(
        evt.request,
        new RequestCookies(requestCookies)
      );

      const res = await handleRoute(route, req, { css: manifest.css });

      res.headers.set("Server", "Pocket Worker");

      const responseCookie =
        res instanceof PocketResponse ? res.cookies.getAll() : null;
      console.log("response cookie", responseCookie);
      if (responseCookie) {
        evt.waitUntil(
          (async () => {
            await setCookies(responseCookie);
            const client = await clients.get(evt.clientId);
            console.log({ client });
            const message: ClientPostMessage = {
              type: "sync-cookies",
            };
            client?.postMessage(message);
          })()
        );
      }

      console.log("retrrn", res.headers, evt);
      return res;
    }

    console.log("fetch fallback", evt.request.url);
    return fetch(evt.request);
  }

  addEventListener("fetch", (evt_: Event) => {
    const evt = evt_ as FetchEvent;
    console.log("fetchevent", evt.request.method, evt.request.url);
    evt.respondWith(handleFetch(evt));
  });

  addEventListener("install", (evt_: Event) => {
    const evt = evt_ as ExtendableEvent;
    evt.waitUntil(handleInstall());
  });
}
