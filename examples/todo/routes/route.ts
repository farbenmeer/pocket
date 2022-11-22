import { html } from "pocket";
import * as cookie from "cookie";
import { nanoid } from "nanoid";

type Todo = {
  id: string;
  title: string;
};

// handles /
export function get(req: Request) {
  console.log("headers", Array.from(req.headers.entries()));
  const { "pocket-todos": rawTodos } = cookie.parse(
    req.headers.get("Cookie") ?? ""
  );
  const todos: Todo[] = rawTodos ? JSON.parse(rawTodos) : [];

  return html`
    <h1>Pocket Todos</h1>
    <form method="POST">
      <input type="hidden" name="id" value="${nanoid()}" />
      <input type="text" name="title" />
      <button>Add</button>
    </form>
    <ul>
      ${todos.map((todo) => html`<li>${todo.title}</li>`)}
    </ul>
  `;
}

export async function post(req: Request) {
  const body = await req.formData();

  const { "pocket-todos": rawTodos } = cookie.parse(
    req.headers.get("Cookie") ?? ""
  );
  const todos: Todo[] = rawTodos ? JSON.parse(rawTodos) : [];

  const title = body.get("title")?.toString();
  const id = body.get("id")?.toString();

  if (id && title && !todos.some((todo) => todo.id === id)) {
    todos.unshift({
      id,
      title,
    });
  }

  return html.withHeaders({
    "Set-Cookie": cookie.serialize("pocket-todos", JSON.stringify(todos), {
      path: "/",
    }),
  })`
    <h1>Pocket Todos</h1>
    <form method="POST">
      <input type="hidden" name="id" value="${nanoid()}" />
      <input type="text" name="title" />
      <button>Add</button>
    </form>
    <ul>
      ${todos.map((todo) => html`<li>${todo.title}</li>`)}
    </ul>
  `;
}
