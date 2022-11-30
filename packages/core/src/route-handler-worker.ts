import { getCookies, setCookies } from "./cookies";
import { Html } from "./html";
import { PocketRequest } from "./pocket-request";
import { PocketResponse } from "./pocket-response";
import { notFound } from "./response-helpers";
import { RouteDefinition } from "./route-handler-common";

export async function setupRouteHandler(routes: RouteDefinition[]) {
  async function handleEvent(evt: FetchEvent) {
    const url = new URL(evt.request.url);

    for (const { path, methods, layouts } of routes) {
      if (url.pathname !== path) {
        continue;
      }

      console.log("route", { path, pathname: url.pathname });

      const method = methods[evt.request.method.toLowerCase()];
      if (!method) {
        console.log("method", method, "notFound");
        return notFound({ headers: { Server: "Pocket Worker" } });
      }

      console.log("getcookies");
      const requestCookie = await getCookies(url);

      const req = new PocketRequest(evt.request, requestCookie);

      let res;
      if (methods.page) {
        function render(props: unknown): Html {
          let html = Html.from(methods.page!({ req, props }));

          for (const { layout } of layouts.reverse()) {
            if (!layout) {
              continue;
            }

            html = Html.from(layout({ req, children: html }));
          }

          return html;
        }

        res = await method({ req, render: render as any });
      } else {
        res = await method({ req } as any);
      }

      if (!(res instanceof Response)) {
        res = new PocketResponse(res);
      }

      res.headers.set("Server", "Pocket Worker");

      const responseCookie =
        res instanceof PocketResponse ? res.cookies.toString() : null;
      console.log("response cookie", responseCookie);
      if (responseCookie) {
        await setCookies(evt.resultingClientId, url, responseCookie);
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
    evt.respondWith(handleEvent(evt));
  });
}
