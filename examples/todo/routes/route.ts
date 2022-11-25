import { nanoid } from "nanoid";
import { html, PocketRequest, PocketResponse } from "pocket";

type Todo = {
  id: string;
  title: string;
};

function template(todos: Todo[]) {
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

// handles /
export async function get(req: PocketRequest) {
  const rawTodos = req.cookies.get("pocket-todos")?.value;
  const todos: Todo[] = rawTodos ? JSON.parse(rawTodos) : [];

  return template(todos);
}

export async function post(req: PocketRequest) {
  const body = await req.formData();

  const rawTodos = req.cookies.get("pocket-todos")?.value;
  const todos: Todo[] = rawTodos ? JSON.parse(rawTodos) : [];

  const title = body.get("title")?.toString();
  const id = body.get("id")?.toString();

  if (id && title && !todos.some((todo) => todo.id === id)) {
    todos.unshift({
      id,
      title,
    });
  }

  const res = new PocketResponse(template(todos));

  res.cookies.set("pocket-todos", JSON.stringify(todos));

  return res;
}
