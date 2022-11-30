import { Html } from "./html";
import { PocketRequest } from "./pocket-request";
import { MaybePromise, Thenable } from "./types";

export type PocketLayoutContext = {
  req: PocketRequest;
  children: Html;
};

export type PocketLayout = (
  context: PocketLayoutContext
) => MaybePromise<string | Html>;

export type PocketPageContext<Props> = {
  req: PocketRequest;
  props: Props;
};

export type PocketPage<Props> = (
  context: PocketPageContext<Props>
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
    readonly page?: PocketPage<unknown>;
  };
  readonly layouts: { path: string; layout: PocketLayout }[];
};
