import { html } from "pocket";

export const container = html.wrap(
  (children) =>
    html`<div class="w-full max-w-7xl mx-auto px-4">${children}</div>`
);
