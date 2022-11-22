export function notFound() {
  return new Response("404 Not Found", {
    status: 404,
    statusText: "Not Found",
    headers: {
      Server: getServerHeader(),
    },
  });
}

export function getServerHeader() {
  if (process.env.POCKET_IS_SERVER) {
    return "Pocket Server";
  }

  return "Pocket Worker";
}
