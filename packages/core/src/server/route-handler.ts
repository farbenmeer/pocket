import * as EdgeRuntimeCookies from "@edge-runtime/cookies";
import { Html } from "../html";
import { PocketRequest } from "../pocket-request";
import { PocketResponse } from "../pocket-response";
import { notFound } from "../response-helpers";
import { RouteDefinition } from "../route-handler-common";
import { getRequestCookies, setResponseCookies } from "./cookies";

export async function setupRouteHandler(routes: RouteDefinition[]) {
  addEventListener("fetch", async (evt_: Event) => {
    const evt = evt_ as FetchEvent;
    const req = new PocketRequest(evt.request, getRequestCookies(evt.request));
    const url = new URL(req.url);

    for (const { path, methods, layouts } of routes) {
      if (url.pathname !== path) {
        continue;
      }

      console.log("route", { path, pathname: url.pathname });

      const method = methods[req.method.toLowerCase()];
      if (!method) {
        evt.respondWith(notFound({ headers: { Server: "Pocket Server" } }));
        return;
      }

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

      setResponseCookies(res);

      res.headers.set("Server", "Pocket Server");
      console.log("retrrn", res.headers);
      evt.respondWith(res);
      return;
    }

    evt.respondWith(notFound({ headers: { Server: "Pocket Server" } }));
  });
}
