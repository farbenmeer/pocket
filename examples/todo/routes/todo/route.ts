import { PocketResponse, PocketRouteContext } from "pocket";
import { Todo } from "routes/route";

export async function put({ req }: PocketRouteContext) {
  const rawTodos = req.cookies.get("pocket-todos")?.value;
  const todos: Todo[] = rawTodos ? JSON.parse(rawTodos) : [];

  const todo: Todo = await req.json();

  const index = todos.findIndex((cur) => cur.id === todo.id);
  if (index !== -1) {
    todos[index] = todo;
    return new PocketResponse(null, {
      cookies: [
        { name: "pocket-todos", value: JSON.stringify(todos), path: "/" },
      ],
    });
  }

  todos.unshift(todo);
  return new PocketResponse(null, {
    cookies: [
      { name: "pocket-todos", value: JSON.stringify(todos), path: "/" },
    ],
  });
}
