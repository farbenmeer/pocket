import { parseCookie, ResponseCookie, serializeCookie } from "../cookies";
import { db } from "./db";
import { ClientPostMessage, WorkerPostMessage } from "./post-message";

addEventListener("message", async (evt: MessageEvent<WorkerPostMessage>) => {
  console.log("worker got message", evt.data);
  switch (evt.data.type) {
    case "send-cookies":
      const cookies = parseCookie(evt.data.cookie);
      const tx = (await db).transaction("cookies", "readwrite");
      await Promise.all(
        cookies.map((cookie) => tx.store.put(cookie, cookie.name))
      );
      tx.commit();
  }
});

async function getClient(clientId: string): Promise<Client | undefined> {
  const clients = (self as any).clients as Clients;

  return clients.get(clientId);
}

export async function getCookies(): Promise<ResponseCookie[]> {
  return (await db).getAll("cookies");
}

export async function setCookies(clientId: string, cookies: ResponseCookie[]) {
  console.log("set cookies", cookies);
  const tx = (await db).transaction("cookies", "readwrite");
  await Promise.all(cookies.map((cookie) => tx.store.put(cookie, cookie.name)));
  tx.commit();

  const client = await getClient(clientId);
  if (client) {
    console.log("got client", client);
  }
  const message: ClientPostMessage = {
    type: "set-cookies",
    cookies: cookies.map(serializeCookie),
  };
  client?.postMessage(message);
  console.log("set cookie done");
}
