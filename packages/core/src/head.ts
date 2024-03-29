import { html } from "./html.js";

export function getPocketHead(options: { css: string | null }) {
  const script = html`
    <script
      defer
      src="/_pocket/runtime.js"
      id="pocket-runtime"
      data-env="${process.env.POCKET_IS_WORKER ? "worker" : "server"}"
    ></script>
  `;

  if (options.css) {
    return html`
      ${script}
      <link rel="stylesheet" href="${options.css}" />
    `;
  }

  return script;
}
