import { nanoid } from "nanoid";
import {
  html,
  PocketPageContext,
  PocketResponse,
  PocketRouteContext,
} from "pocket";

type Todo = {
  id: string;
  title: string;
  done: boolean;
};

type Props = {
  todos: Todo[];
};

export function page({ props }: PocketPageContext<Props>) {
  return html`
    <h1>Pocket Todos</h1>
    <form method="POST">
      <input type="hidden" name="id" value="${nanoid()}" />
      <input type="text" name="title" />
      <button>Add</button>
    </form>
    <ul>
      ${props.todos.map((todo) => {
        const onchange = `location.replace('?${
          todo.done ? "uncheck" : "check"
        }=${todo.id}')`;

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
export async function get({ req, render }: PocketRouteContext<Props>) {
  const rawTodos = req.cookies.get("pocket-todos")?.value;
  const todos: Todo[] = rawTodos ? JSON.parse(rawTodos) : [];

  const url = new URL(req.url);
  const check = url.searchParams.get("check");
  const uncheck = url.searchParams.get("uncheck");
  const todo = todos.find((todo) => todo.id === check || todo.id === uncheck);
  if (todo) {
    todo.done = Boolean(check);
    const res = new PocketResponse(render({ todos }));
    res.cookies.set("pocket-todos", JSON.stringify(todos));
    return res;
  }

  return render({ todos });
}

export async function post({ req, render }: PocketRouteContext<Props>) {
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

  res.cookies.set("pocket-todos", JSON.stringify(todos));

  return res;
}
