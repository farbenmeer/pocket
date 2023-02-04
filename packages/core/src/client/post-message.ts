import { syncCookies } from "./cookies.js";

export type ClientPostMessage = {
  type: "sync-cookies";
};

export function setupPostMessageHandler() {
  addEventListener(
    "message",
    async function postMessageHandler(event: MessageEvent<ClientPostMessage>) {
      console.log("handle post message", event.data);
      switch (event.data.type) {
        case "sync-cookies":
          await syncCookies();
          return;
      }
    }
  );
}
