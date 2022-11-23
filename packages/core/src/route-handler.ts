import {
  CookieStore,
  MemoryCookieStore,
  PostMessageCookieStore,
} from "./cookie-store";
import { Html } from "./html";
import { PocketRequest } from "./pocket-request";
import { getServerHeader, notFound } from "./response-helpers";

type MaybePromise<T> = Promise<T> | T;
type MethodHandler = (
  req: Request
) => MaybePromise<string> | MaybePromise<Html> | MaybePromise<Response>;
type Layout = (req: Request) => MaybePromise<Html>;

export type Route = {
  path: string;
  methods: Record<string, MethodHandler>;
  layouts: Layout[];
};

let polyfilledCookieStore: CookieStore | null = null;

if (process.env.POCKET_IS_WORKER) {
  if (typeof cookieStore === "undefined") {
    const postMessageCookieStore = new PostMessageCookieStore();
    function installHandler(event: ExtendableEvent) {
      event.waitUntil(postMessageCookieStore.init());
    }
    addEventListener("install", installHandler as any);
  } else {
    polyfilledCookieStore = cookieStore;
  }
}

export async function routeHandler(routes: Route[], ev: FetchEvent) {
  const cookieStore = process.env.POCKET_IS_WORKER
    ? polyfilledCookieStore
    : new MemoryCookieStore(ev.request.headers.get("Cookie") ?? "");
  const req = new PocketRequest(ev.request, cookieStore!);
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

    if (typeof res === "string") {
      res = new Html(Object.assign([""], { raw: [""] }), [res]);
    }

    if (res instanceof Html) {
      console.log("is html");
      const layoutHtml =
        preloadedLayoutHtml ?? layouts.map((layout) => layout(req));

      for await (const layout of layoutHtml) {
        res = layout.withChild(res);
      }

      const headers = res.headers ?? new Headers();
      headers.set("Content-Type", "text/html");

      res = new Response(res.renderToStream(), {
        headers,
      });
    }

    if (process.env.POCKET_IS_SERVER) {
      console.log("set cookies");
      for (const cookie of (cookieStore as MemoryCookieStore).serialize()) {
        console.log("set", cookie);
        res.headers.append("Set-Cookie", cookie);
      }
    }
    res.headers.set("Server", getServerHeader());

    console.log("retrrn", res.headers);
    return res;
  }

  return process.env.POCKET_IS_SERVER ? notFound() : fetch(req);
}
