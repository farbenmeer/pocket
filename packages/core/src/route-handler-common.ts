import { getPocketHead } from "./head";
import { Html } from "./html";
import { PocketRequest } from "./pocket-request";
import { PocketResponse } from "./pocket-response";
import { notFound } from "./response-helpers";
import { MaybePromise, Thenable } from "./types";

export type PocketLayoutContext = {
  req: PocketRequest;
  children: Html;
};

export type PocketLayout = (
  context: PocketLayoutContext
) => MaybePromise<string | Html>;

export type PocketHeadContext<Props> = {
  req: PocketRequest;
  props: Props;
  children: Html;
};

export type PocketBodyContext<Props> = {
  req: PocketRequest;
  props: Props;
};

export type PocketHead<Props> = (
  context: PocketHeadContext<Props>
) => MaybePromise<string | Html>;

export type PocketBody<Props> = (
  context: PocketBodyContext<Props>
) => MaybePromise<string | Html>;

export type PocketRouteContext<Props = never> = {
  req: PocketRequest;
  render: Props extends never ? undefined : (props: Props) => Html;
};

export type PocketRoute<Props> = (
  context: PocketRouteContext<Props>
) => MaybePromise<string | Html | Response>;

export type RouteDefinition = {
  readonly path: string;
  readonly methods: {
    readonly [method: string]: PocketRoute<unknown>;
  } & {
    readonly head?: PocketHead<unknown>;
    readonly body?: PocketBody<unknown>;
  };
  readonly layouts: {
    path: string;
    layout: {
      readonly head?: PocketLayout;
      readonly body?: PocketLayout;
    };
    pathDigest: string;
  }[];
};

export async function handleRoute(
  { methods, layouts }: RouteDefinition,
  req: PocketRequest,
  options: { css: boolean }
) {
  const method = methods[req.method.toLowerCase()];

  if (!method && !methods.body) {
    return notFound();
  }

  let res;
  if (methods.body) {
    const root = req.headers.get("X-Pocket-Root");

    const activeLayouts = root
      ? layouts.filter((layout) => !root.startsWith(layout.path))
      : layouts;

    function render(props: unknown): Html {
      let body = Html.from(methods.body!({ req, props }));
      let head = getPocketHead(options);

      if (methods.head) {
        head = Html.from(
          methods.head({ req, props, children: getPocketHead(options) })
        );
      }

      for (const layout of activeLayouts) {
        if (layout.layout.head) {
          head = Html.from(
            layout.layout.head({
              req,
              children: new Html(
                [
                  `<div style="display:none;" id="_pocket-b${layout.pathDigest}"></div>`,
                  `<div style="display:none;" id="_pocket-a${layout.pathDigest}"></div>`,
                ],
                [head]
              ),
            })
          );
        }

        if (layout.layout.body) {
          body = Html.from(
            layout.layout.body({
              req,
              children: new Html(
                [
                  `<div style="display:none;" id="_pocket-b${layout.pathDigest}"></div>`,
                  `<div style="display:none;" id="_pocket-a${layout.pathDigest}"></div>`,
                ],
                [body]
              ),
            })
          );
        }
      }

      return Html.join(head, body);
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
    return notFound();
  }

  if (!(res instanceof Response)) {
    res = new PocketResponse(res);
  }

  return res;
}
