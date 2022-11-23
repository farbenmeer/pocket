import { html, PocketRequest } from "pocket";
import * as cookie from "cookie";
import { nanoid } from "nanoid";

type Todo = {
  id: string;
  title: string;
};

// handles /
export async function get(req: PocketRequest) {
  console.log("headers", Array.from(req.headers.entries()));
  const rawTodos = (await req.cookies.get("pocket-todos"))?.value;
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

export async function post(req: PocketRequest) {
  const body = await req.formData();

  const rawTodos = (await req.cookies.get("pocket-todos"))?.value;
  const todos: Todo[] = rawTodos ? JSON.parse(rawTodos) : [];

  const title = body.get("title")?.toString();
  const id = body.get("id")?.toString();

  if (id && title && !todos.some((todo) => todo.id === id)) {
    todos.unshift({
      id,
      title,
    });
  }

  await req.cookies.set("pocket-todos", JSON.stringify(todos));

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
