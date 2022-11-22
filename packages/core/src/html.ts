import escape from "escape-html";
import { wrap } from "module";

export const outlet = Symbol("Outlet");

type Arg = string | typeof outlet | Html | (string | Html)[];

export function html(strings: TemplateStringsArray, ...args: Arg[]) {
  return new Html(strings, args);
}

html.withHeaders = function withHeaders(init: HeadersInit) {
  return function html(strings: TemplateStringsArray, ...args: Arg[]) {
    const html = new Html(strings, args);
    html.headers = new Headers(init);
    return html;
  };
};

export class Html {
  private textEncoder = new TextEncoder();
  headers?: Headers;

  constructor(private strings: TemplateStringsArray, private args: Arg[]) {}

  withChild(child: Html): Html {
    const wrapped = new Html(
      this.strings,
      this.args.map((arg) => {
        if (arg === outlet) {
          return child;
        }
        return arg;
      })
    );

    if (this.headers || child.headers) {
      wrapped.headers = new Headers();
      this.headers?.forEach((value, key) =>
        wrapped.headers?.append(key, value)
      );
      child.headers?.forEach((value, key) =>
        wrapped.headers?.append(key, value)
      );
    }

    return wrapped;
  }

  renderToStream(): ReadableStream {
    const strings = this.strings;
    const args = this.args;
    const textEncoder = this.textEncoder;

    return new ReadableStream({
      async start(controller) {
        for (let index in strings) {
          const string = strings[index];
          const arg = args[index];

          controller.enqueue(textEncoder.encode(string));

          if (arg === outlet) {
            throw new Error("Outlets should only be used in layouts");
          }

          const argArr = Array.isArray(arg) ? arg : [arg];

          for (const arg of argArr) {
            if (arg instanceof Html) {
              const childReader = arg.renderToStream().getReader();
              while (true) {
                const { done, value } = await childReader.read();

                if (done) {
                  break;
                }

                controller.enqueue(value);
              }
              continue;
            }

            if (arg) {
              controller.enqueue(textEncoder.encode(escape(arg)));
            }
          }
        }
        controller.close();
      },
    });
  }

  toString(): string {
    return this.strings
      .map((string, index) => {
        const arg = this.args[index];

        if (arg === outlet) {
          throw new Error("Outlets should only be used in layouts");
        }

        const argArr = Array.isArray(arg) ? arg : [arg];

        for (const arg of argArr) {
          if (arg instanceof Html) {
            return string + arg.toString();
          }

          if (arg) {
            return string + escape(arg);
          }
        }

        return string;
      })
      .join("");
  }
}

export const pocketScript = html`
  <script defer src="/_pocket/runtime.js"></script>
`;
