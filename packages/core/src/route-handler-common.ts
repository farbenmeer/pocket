import { getPocketHead } from "./head";
import { Html } from "./html";
import { PocketRequest } from "./pocket-request";
import { PocketResponse } from "./pocket-response";
import { notFound } from "./response-helpers";
import { MaybePromise } from "./types";

export type LayoutHeadContext = {
  req: PocketRequest;
};

export type LayoutHead = (
  context: LayoutHeadContext
) => MaybePromise<string | Html>;

export type LayoutBodyContext = {
  req: PocketRequest;
  children: Html;
};

export type LayoutBody = (
  context: LayoutBodyContext
) => MaybePromise<string | Html>;

export type RouteHeadContext<Props> = {
  req: PocketRequest;
  props: Props;
};

export type RouteHead<Props> = (
  context: RouteHeadContext<Props>
) => MaybePromise<string | Html>;

export type RouteBodyContext<Props> = {
  req: PocketRequest;
  props: Props;
};

export type RouteBody<Props> = (
  context: RouteBodyContext<Props>
) => MaybePromise<string | Html>;

export type RouteHandlerContext<Props = never> = {
  req: PocketRequest;
  render: Props extends never ? undefined : (props: Props) => Html;
};

export type RouteHandler<Props> = (
  context: RouteHandlerContext<Props>
) => MaybePromise<string | Html | Response>;

export type RouteDefinition = {
  readonly path: string;
  readonly methods: {
    readonly [method: string]: RouteHandler<unknown>;
  } & {
    readonly head?: RouteHead<unknown>;
    readonly body?: RouteBody<unknown>;
  };
  readonly layouts: {
    path: string;
    layout: {
      readonly head?: LayoutHead;
      readonly body?: LayoutBody;
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
    function render(props: unknown): Html {
      let body = Html.from(methods.body!({ req, props }));
      const head = [];

      if (methods.head) {
        head.push(Html.from(methods.head({ req, props })));
      }

      for (const layout of layouts) {
        if (layout.layout.head) {
          head.unshift(
            Html.from(
              layout.layout.head({
                req,
              })
            )
          );
        }

        if (layout.layout.body) {
          body = Html.from(
            layout.layout.body({
              req,
              children: body,
            })
          );
        }
      }

      return new Html(
        ["<!DOCTYPE html><html><head>", "", "</head><body>", "</body></html>"],
        [head, getPocketHead(options), body]
      );
    }

    if (method) {
      res = await method({ req, render: render as any });
    } else {
      res = new PocketResponse(render(undefined));
    }

    if (!(res instanceof Response)) {
      res = new PocketResponse(res);
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
