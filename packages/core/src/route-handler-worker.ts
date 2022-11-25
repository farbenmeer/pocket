import { getCookiesFromClient, setCookiesOnClient } from "./cookies";
import { Html } from "./html";
import { PocketRequest } from "./pocket-request";
import { PocketResponse } from "./pocket-response";
import { notFound } from "./response-helpers";
import { Route } from "./route-handler-common";

async function getClient(evt: FetchEvent): Promise<Client | undefined> {
  const clients = (self as any).clients as Clients;
  const client =
    (await clients.get(evt.resultingClientId)) ??
    (await clients.get(evt.clientId));

  return client;
}

export async function routeHandler(routes: Route[], evt: FetchEvent) {
  const client = await getClient(evt);
  if (!client) {
    return new Response();
  }
  const cookie = await getCookiesFromClient(client);

  const req = new PocketRequest(evt.request, cookie);
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

    res.headers.set("Server", "Pocket Worker");

    const client = await getClient(evt);
    const cookie = res.headers.get("Set-Cookie");
    if (client && cookie) {
      setCookiesOnClient(client, cookie);
    }

    console.log("retrrn", res.headers);
    return res;
  }

  return fetch(req);
}
