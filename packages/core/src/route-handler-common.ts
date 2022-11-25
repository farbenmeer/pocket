import { Html } from "./html";

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
