import { getCookies, setCookies } from "./cookies";
import { RequestCookies } from "../cookies";
import { Html } from "../html";
import { PocketRequest } from "../pocket-request";
import { PocketResponse } from "../pocket-response";
import { notFound } from "../response-helpers";
import { RouteDefinition } from "../route-handler-common";
import { ClientPostMessage } from "../client/post-message";

declare var clients: Clients;

export async function setupRouteHandler(routes: RouteDefinition[]) {
  console.log(routes);
  async function handleEvent(evt: FetchEvent) {
    const url = new URL(evt.request.url);

    if (url.hostname !== location.hostname) {
      return fetch(evt.request);
    }

    for (const { path, methods, layouts } of routes) {
      console.log("match", path, url.pathname);
      if (url.pathname !== path) {
        continue;
      }

      const method = methods[evt.request.method.toLowerCase()];

      if (!method && !methods.page) {
        return notFound({ headers: { Server: "Pocket Worker" } });
      }

      const requestCookies = await getCookies();

      const req = new PocketRequest(
        evt.request,
        new RequestCookies(requestCookies)
      );

      let res;
      if (methods.page) {
        const root = req.headers.get("X-Pocket-Root");

        const activeLayouts = root
          ? layouts.filter((layout) => !root.startsWith(layout.path))
          : layouts;

        function render(props: unknown): Html {
          let html = Html.from(methods.page!({ req, props }));

          for (const { layout, pathDigest } of activeLayouts) {
            if (!layout) {
              continue;
            }

            html = Html.from(
              layout({
                req,
                children: new Html(
                  [
                    `<div style="display:none;" id="_pocket-b${pathDigest}"></div>`,
                    `<div style="display:none;" id="_pocket-a${pathDigest}"></div>`,
                  ],
                  [html]
                ),
              })
            );
          }

          return html;
        }

        const targetLayout = layouts.find((layout) =>
          root?.startsWith(layout.path)
        );

        if (method) {
          res = await method({ req, render: render as any });
        } else {
          res = new PocketResponse(render(undefined));
        }

        if (!(res instanceof Response)) {
          res = new PocketResponse(res);
        }

        if (targetLayout) {
          res.headers.set("X-Pocket-Target", targetLayout?.pathDigest);
        }
      } else if (method) {
        res = await method({ req } as any);
      } else {
        return notFound({ headers: { Server: "Pocket Worker" } });
      }

      if (!(res instanceof Response)) {
        res = new PocketResponse(res);
      }

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
    evt.respondWith(handleEvent(evt));
  });
}
