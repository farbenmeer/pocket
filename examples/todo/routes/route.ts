import { nanoid } from "nanoid";
import {
  html,
  RouteBodyContext,
  PocketResponse,
  RouteHandlerContext,
} from "pocket";

export type Todo = {
  id: string;
  title: string;
  done: boolean;
};

type Props = {
  todos: Todo[];
};

export function body({ props }: RouteBodyContext<Props>) {
  return html`
    <h1>Pocket Todos</h1>
    <form method="POST">
      <input type="hidden" name="id" value="${nanoid()}" />
      <input type="text" name="title" />
      <button>Add</button>
    </form>
    <ul>
      ${props.todos.map((todo) => {
        const onchange = `fetch('/todo', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: '{\
            \\"id\\": \\"${todo.id}\\",\
            \\"title\\": \\"${todo.title}\\",\
            \\"done\\": ${todo.done ? "false" : "true"}\
          }'
        })`;

        return html`<li>
          <input
            type="checkbox"
            ${todo.done ? "checked" : ""}
            onchange="${onchange}"
          />${todo.title}
        </li>`;
      })}
    </ul>
  `;
}

// handles /
export async function get({ req, render }: RouteHandlerContext<Props>) {
  const rawTodos = req.cookies.get("pocket-todos")?.value;
  const todos: Todo[] = rawTodos ? JSON.parse(rawTodos) : [];

  return render({ todos });
}

export async function post({ req, render }: RouteHandlerContext<Props>) {
  const body = await req.formData();

  const rawTodos = req.cookies.get("pocket-todos")?.value;
  const todos: Todo[] = rawTodos ? JSON.parse(rawTodos) : [];

  const title = body.get("title")?.toString();
  const id = body.get("id")?.toString();

  if (id && title && !todos.some((todo) => todo.id === id)) {
    todos.unshift({
      id,
      title,
      done: false,
    });
  }

  const res = new PocketResponse(render({ todos }));

  res.cookies.set("pocket-todos", JSON.stringify(todos), { path: "/" });

  return res;
}
