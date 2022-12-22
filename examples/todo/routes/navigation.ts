import { html, Html } from "pocket";

export function navigation(): Html {
  return html`
    <nav>
      <ul>
        <li><a href="/" root>Home</a></li>
        <li><a href="/contact" root>Contact</a></li>
      </ul>
    </nav>
  `;
}
