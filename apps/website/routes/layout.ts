import { html, LayoutBodyContext } from "pocket";
import "tailwindcss/tailwind.css";
import { navigation } from "./navigation";

export function head() {
  return html`
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pocket Framework</title>
  `;
}

export function body({ children }: LayoutBodyContext) {
  return html` ${navigation()} ${children} `;
}
