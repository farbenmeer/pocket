import { html, LayoutBodyContext } from "pocket";
import "./main.css";
import { navigation } from "./navigation.js";

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
