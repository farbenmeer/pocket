import { html, safeHtml } from "common-tags";

// handles /
export function get(req: Request) {
  return new Response(template(), { headers: { "Content-Type": "text/html" } });
}

const pocketScript = safeHtml`
  <script src="/_pocket/register-worker.js"></script>
`;

function template() {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        ${pocketScript}
      </head>
      <body>
        Hello World
      </body>
    </html>
  `;
}
