import { ClientPostMessage } from "../client/post-message.js";
import { RequestCookies } from "../cookies.js";
import { PocketRequest } from "../pocket-request.js";
import { PocketResponse } from "../pocket-response.js";
import { handleRoute, RouteDefinition } from "../route-handler-common.js";
import { getCookies, setCookies } from "./cookies.js";

declare var self: ServiceWorkerGlobalScope;

export async function setupRouteHandler(routes: RouteDefinition[]) {
  async function handleFetch(evt: FetchEvent) {
    const url = new URL(evt.request.url);
    console.log("handle", url);

    if (url.hostname !== location.hostname) {
      return fetch(evt.request);
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

      const res = await handleRoute(route, req);

      res.headers.set("Server", "Pocket Worker");

      const responseCookie =
        res instanceof PocketResponse ? res.cookies.getAll() : null;
      console.log("response cookie", responseCookie);
      if (responseCookie) {
        evt.waitUntil(
          (async () => {
            await setCookies(responseCookie);
            const client = await self.clients.get(evt.clientId);
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

  async function handleInstall() {
    if (process.env.NODE_ENV === "development") {
      const eventSource = new EventSource("/_pocket/dev-events");

      eventSource.addEventListener("message", async () => {
        console.log("received message");

        await self.registration.unregister();

        const activeClients = await self.clients.matchAll({ type: "window" });
        activeClients.forEach((client) => {
          client.navigate(client.url);
        });
      });

      self.skipWaiting();
    }
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
