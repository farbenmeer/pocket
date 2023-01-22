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
      console.debug("match", path, url.pathname);
      if (url.pathname !== path) {
        continue;
      }

      const method = methods[req.method.toLowerCase()];
      if (!method && !methods.page) {
        evt.respondWith(notFound({ headers: { Server: "Pocket Server" } }));
        return;
      }

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
        return notFound({ headers: { Server: "Pocket Server" } });
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
