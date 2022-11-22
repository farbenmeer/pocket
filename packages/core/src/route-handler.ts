import { Html } from "./html";
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

export async function routeHandler(routes: Route[], req: Request) {
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

    res.headers.set("Server", getServerHeader());

    console.log("retrrn", res.headers);
    return res;
  }
}
