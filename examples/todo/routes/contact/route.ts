import { html } from "pocket";
import { table } from "./table";

// handles /contact
export function page() {
  return html`
    <main>
      ${table({
        head: html`
          <tr>
            <th>Kind</th>
            <th>Datum</th>
          </tr>
        `,
        body: html`
          <tr>
            <td>Tel</td>
            <td>123456789</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>contact@todo.pocket</td>
          </tr>
        `,
      })}
    </main>
  `;
}
