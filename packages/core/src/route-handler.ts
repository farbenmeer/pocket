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
    console.log("route", { path, pathname: url.pathname });
    if (url.pathname !== path) {
      continue;
    }
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
      const layoutHtml =
        preloadedLayoutHtml ?? layouts.map((layout) => layout(req));

      for await (const layout of layoutHtml) {
        res = layout.withChild(res);
      }

      res = new Response(res.renderToStream(), {
        headers: { "Content-Type": "text/html" },
      });
    }

    res.headers.set("Server", getServerHeader());

    return res;
  }

  if (process.env.POCKET_IS_SERVER) {
    return notFound();
  } else {
    return fetch(req);
  }
}
