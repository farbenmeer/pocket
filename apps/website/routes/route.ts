import { container } from "components/container.js";
import { html } from "pocket";
import readme from "../../../README.md";
import markdown from "components/markdown.module.css";

export function body() {
  return html`<section class="py-8">
    ${container.html`
      <p>
        Welcome to Pocket. This page is (of course) rendered by pocket.
        It will seamlessly work on slow connections and even offline by default.
      </p>
      <p>
        This page, all documentation and the framework are very much work in progress.
      </p>
      <article class="${markdown.content}">
        ${readme}
      </article>
  `}
  </section>`;
}
