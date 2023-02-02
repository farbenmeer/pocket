import { container } from "components/container";
import { html } from "pocket";

export function body() {
  return html`<section class="py-8">${container.html`Hello World`}</section>`;
}
