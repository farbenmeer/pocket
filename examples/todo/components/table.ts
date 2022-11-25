import { html, Html } from "pocket";

type TableProps = { head: Html; body: Html };

export function table(props: TableProps) {
  return html`
    <table>
      <thead>
        ${props.head}
      </thead>
      <tbody>
        ${props.body}
      </tbody>
    </table>
  `;
}
