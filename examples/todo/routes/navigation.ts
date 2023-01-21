import { html, Html } from "pocket";

export function navigation(): Html {
  return html`
    <nav>
      <ul>
        <li><a href="/" soft>Home</a></li>
        <li><a href="/contact" soft>Contact</a></li>
      </ul>
    </nav>
  `;
}
