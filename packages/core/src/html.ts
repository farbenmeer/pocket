import escape from "escape-html";
import { MaybeArray, MaybePromise } from "./types";

type Arg = MaybeArray<MaybePromise<string | Html | null | false | number>>;

export function html(strings: TemplateStringsArray, ...args: Arg[]) {
  return new Html(strings, args);
}

html.raw = function raw(content: string) {
  return new Html([content], []);
};

export class Html {
  constructor(
    private strings: string[] | TemplateStringsArray,
    private args: Arg[]
  ) {}

  renderToStream(): ReadableStream<Uint8Array> {
    const strings = this.strings;
    const args = this.args;
    const textEncoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        for (let index in strings) {
          const string = strings[index];
          const arg = args[index];

          if (string) {
            controller.enqueue(textEncoder.encode(string));
          }

          const argArr = Array.isArray(arg) ? arg : [arg];

          for (const arg of argArr) {
            const value = await arg;

            if (!value) {
              continue;
            }

            if (typeof value === "string") {
              controller.enqueue(textEncoder.encode(escape(value)));
              continue;
            }

            if (typeof value === "number") {
              controller.enqueue(textEncoder.encode(value.toString()));
              continue;
            }

            if (value instanceof Html) {
              const childReader = value.renderToStream().getReader();
              while (true) {
                const { done, value } = await childReader.read();

                if (done) {
                  break;
                }

                controller.enqueue(value);
              }
              continue;
            }

            throw new TypeError("Argument is not of any allowed type");
          }
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
      const { done, value } = await reader.read();

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
