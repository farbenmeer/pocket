import { html } from "pocket";
import * as cookie from "cookie";

// handles /
export function get(req: Request) {
  const { "pocket-todos": rawTodos } = cookie.parse(
    req.headers.get("Cookie") ?? ""
  );
  const todos: string[] = rawTodos ? JSON.parse(rawTodos) : [];

  return html`
    <h1>Pocket Todos</h1>
    <form method="POST">
      <input type="text" name="title" />
      <button>Add</button>
    </form>
    <ul>
      ${todos.map((todo) => html`<li>${todo}</li>`)}
    </ul>
  `;
}

export async function post(req: Request) {
  const body = await req.formData();

  const { "pocket-todos": rawTodos } = cookie.parse(
    req.headers.get("Cookie") ?? ""
  );
  const todos: string[] = rawTodos ? JSON.parse(rawTodos) : [];

  const title = body.get("title")?.toString();

  if (title) {
    todos.unshift(title);
  }

  return html`
    <h1>Pocket Todos</h1>
    <form method="POST">
      <input type="text" name="title" />
      <button>Add</button>
    </form>
    <ul>
      ${todos.map((todo) => html`<li>${todo}</li>`)}
    </ul>
  `;
}
