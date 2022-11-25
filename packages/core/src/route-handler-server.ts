import { PocketRequest } from "./pocket-request";
import { PocketResponse } from "./pocket-response";
import { notFound } from "./response-helpers";
import { Route } from "./route-handler-common";

export async function routeHandler(routes: Route[], ev: FetchEvent) {
  const req = new PocketRequest(ev.request);
  const url = new URL(req.url);

  for (const { path, methods, layouts } of routes) {
    if (url.pathname !== path) {
      continue;
    }
    console.log("route", { path, pathname: url.pathname });
    const preloadedLayoutHtml = req.headers
      .get("Accept")
      ?.startsWith("text/html")
      ? layouts.map((layout) => layout(req))
      : null;

    const method = methods[req.method.toLowerCase()];
    if (!method) {
      return notFound();
    }

    let res = await method(req);

    if (!(res instanceof Response)) {
      res = new PocketResponse(res);
    }

    if (res instanceof PocketResponse && res._htmlBody) {
      console.log("is html");
      const layoutHtml =
        preloadedLayoutHtml ?? layouts.map((layout) => layout(req));

      let html = res._htmlBody;

      for await (const layout of layoutHtml) {
        html = layout.withChild(html);
      }

      res = new PocketResponse(html.renderToStream(), res);
    }

    res.headers.set("Server", "Pocket Server");

    console.log("retrrn", res.headers);
    return res;
  }

  const res = notFound();
  res.headers.set("Server", "Pocket Server");

  return res;
}
