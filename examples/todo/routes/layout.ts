import { html, PocketLayoutContext, pocketScript } from "pocket";
import { navigation } from "./navigation";

export function layout({ children }: PocketLayoutContext) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pocket Todos</title>
        ${pocketScript}
      </head>
      <body>
        ${navigation()} ${children}
      </body>
    </html>
  `;
}
