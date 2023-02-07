import { container } from "components/container.js";
import { html, Html } from "pocket";

export function navigation(): Html {
  return html`
    <nav class="bg-orange-600 relative py-4">
      ${container.html`
        <div class="flex flex-row justify-between">
          <ul class="flex flex-row gap-8">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/api">API</a></li>
          </ul>
          <div>Pocket</div>
        </div>
      `}
    </nav>
  `;
}
