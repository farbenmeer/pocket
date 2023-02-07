import markdown from "components/markdown.module.css";
import { Html, html } from "pocket";
import { container } from "./container.js";

export function docsPage(props: {
  items: { id: string; title: string; content: Html }[];
}) {
  return container.html`
    <div class="grid md:grid-cols-4 lg:grid-cols-5 py-8 gap-4 relative">
      <div class="py-4">
        <nav aria-label="about" class="sticky top-12 block">
          <ul>
            ${props.items.map(
              (item) => html` <li><a href="#${item.id}">${item.title}</a></li> `
            )}
          </ul>
        </nav>
      </div>
      <main class="md:col-span-3 lg:col-span-4 overflow-hidden">
        ${props.items.map(
          (item) => html`
            <article class="${markdown.content}" id="${item.id}">
              ${item.content}
            </article>
          `
        )}
      </main>
    </div>
  `;
}
