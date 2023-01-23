import { Html } from "../html";
import { PocketRequest } from "../pocket-request";
import { PocketResponse } from "../pocket-response";
import { notFound } from "../response-helpers";
import { RouteDefinition } from "../route-handler-common";
import { getRequestCookies, setResponseCookies } from "../server/cookies";

export async function handleRoute(
  { methods, layouts }: RouteDefinition,
  originalRequest: Request
) {
  console.log("handle request", originalRequest.url);
  return new Response("Hello World");
  //const req = new PocketRequest(
  //  originalRequest,
  //  getRequestCookies(originalRequest)
  //);

  //const method = methods[req.method.toLowerCase()];

  //if (!method && !methods.page) {
  //  return notFound({ headers: { Server: "Pocket Vercel Edge" } });
  //}

  //let res;
  //if (methods.page) {
  //  const root = req.headers.get("X-Pocket-Root");

  //  const activeLayouts = root
  //    ? layouts.filter((layout) => !root.startsWith(layout.path))
  //    : layouts;

  //  function render(props: unknown): Html {
  //    let html = Html.from(methods.page!({ req, props }));

  //    for (const { layout, pathDigest } of activeLayouts) {
  //      if (!layout) {
  //        continue;
  //      }

  //      html = Html.from(
  //        layout({
  //          req,
  //          children: new Html(
  //            [
  //              `<div style="display:none;" id="_pocket-b${pathDigest}"></div>`,
  //              `<div style="display:none;" id="_pocket-a${pathDigest}"></div>`,
  //            ],
  //            [html]
  //          ),
  //        })
  //      );
  //    }

  //    return html;
  //  }

  //  const targetLayout = layouts.find((layout) =>
  //    root?.startsWith(layout.path)
  //  );

  //  if (method) {
  //    res = await method({ req, render: render as any });
  //  } else {
  //    res = new PocketResponse(render(undefined));
  //  }

  //  if (!(res instanceof Response)) {
  //    res = new PocketResponse(res);
  //  }

  //  if (targetLayout) {
  //    res.headers.set("X-Pocket-Target", targetLayout?.pathDigest);
  //  }
  //} else if (method) {
  //  res = await method({ req } as any);
  //} else {
  //  return notFound({ headers: { Server: "Pocket Vercel Edge" } });
  //}

  //if (!(res instanceof Response)) {
  //  res = new PocketResponse(res);
  //}

  //setResponseCookies(res);

  //res.headers.set("server", "Pocket Vercel Edge");

  //return res;
}
