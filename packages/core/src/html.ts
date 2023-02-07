import escape from "escape-html";
import { MaybeArray, MaybePromise } from "./types.js";

type Arg = MaybeArray<
  MaybePromise<string | Html | null | false | undefined | number>
>;

export function html(strings: TemplateStringsArray, ...args: Arg[]) {
  return /* #__PURE__ */ new Html(strings, args);
}

html.raw = function raw(content: string) {
  return /* #__PURE__ */ new Html([content], []);
};

html.wrap = function wrap(component: (children: Html) => Html) {
  return {
    /* #__PURE__ */ html(
      childrenStrings: TemplateStringsArray,
      ...childrenArgs: Arg[]
    ) {
      return /* #__PURE__ */ component(new Html(childrenStrings, childrenArgs));
    },
  };
};

export const wrap = html.wrap;

export class Html {
  constructor(
    private strings: string[] | TemplateStringsArray,
    private args: Arg[]
  ) {
    if (strings.length === args.length) {
      this.strings = [...strings, ""];
    } else if (strings.length !== args.length + 1) {
      throw new Error("strings.length must be args.length + 1");
    }
  }

  renderToStream(): ReadableStream<Uint8Array> {
    const strings = [...this.strings];
    const args = [...this.args];
    const textEncoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        while (strings.length > 0) {
          const string = strings.shift()!;
          const arg = args.shift();

          if (string) {
            controller.enqueue(textEncoder.encode(string));
          }

          if (Array.isArray(arg)) {
            args.unshift(...arg);
            strings.unshift(...arg.map(() => ""));
            continue;
          }

          const value = await arg;

          if (typeof value === "string") {
            controller.enqueue(textEncoder.encode(escape(value)));
            continue;
          }

          if (typeof value === "number") {
            controller.enqueue(textEncoder.encode(value.toString()));
            continue;
          }

          if (!value) {
            continue;
          }

          if (value instanceof Html) {
            strings.unshift(...value.strings);
            args.unshift(...value.args, null);
            continue;
          }

          console.error("wrong arg", arg, Html);
          throw new TypeError("Argument is not of any allowed type");
        }
        controller.close();
      },
    });
  }

  async renderToString() {
    const stream = this.renderToStream();
    const decoder = new TextDecoder();
    const reader = stream.getReader();

    const out: string[] = [];
    while (true) {
      console.log("read next value");
      const { done, value } = await reader.read();
      console.log("read value");

      if (done) {
        return out.join("");
      }

      out.push(decoder.decode(value));
    }
  }

  static from(arg: Arg): Html {
    if (arg instanceof Html) {
      return arg;
    }
    return new Html([""], [arg]);
  }

  static join(...children: Html[]) {
    const strings: string[] = [];
    const args: Arg[] = [];

    for (const child of children) {
      strings.push(...child.strings);
      args.push(...child.args);

      while (strings.length > args.length) {
        args.push("");
      }
    }

    return new Html(strings, args);
  }
}

export const pocketScript = html`
  <script
    defer
    src="/_pocket/runtime.js"
    id="pocket-runtime"
    data-env="${process.env.POCKET_IS_WORKER ? "worker" : "server"}"
  ></script>
`;
