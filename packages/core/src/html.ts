import escape from "escape-html";

export const outlet = Symbol("Outlet");

type Arg = string | typeof outlet | Html;

export function html(strings: TemplateStringsArray, ...args: Arg[]) {
  return new Html(strings, args);
}

export class Html {
  private textEncoder = new TextEncoder();

  constructor(private strings: TemplateStringsArray, private args: Arg[]) {}

  withChild(child: Html): Html {
    return new Html(
      this.strings,
      this.args.map((arg) => {
        if (arg === outlet) {
          return child;
        }
        return arg;
      })
    );
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
        controller.close();
      },
    });
  }
}

export const pocketScript = html`
  <script defer src="/_pocket/runtime.js"></script>
`;
