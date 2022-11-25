import { html, Html } from "pocket";

export function navigation(): Html {
  return html`
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  `;
}
