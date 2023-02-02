import { html, Html } from "pocket";

export function navigation(): Html {
  return html`
    <nav className="bg-orange-600">
      <ul>
        <li><a href="/">Home</a></li>
      </ul>
    </nav>
  `;
}
