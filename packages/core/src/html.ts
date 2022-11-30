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
  private textEncoder = new TextEncoder();

  constructor(
    private strings: string[] | TemplateStringsArray,
    private args: Arg[]
  ) {}

  renderToStream(): ReadableStream {
    const strings = this.strings;
    const args = this.args;
    const textEncoder = this.textEncoder;

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

  static from(arg: Arg): Html {
    if (arg instanceof Html) {
      return arg;
    }
    return new Html([""], [arg]);
  }
}

export const pocketScript = html`
  <script defer src="/_pocket/runtime.js"></script>
`;
