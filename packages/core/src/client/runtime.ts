import { syncCookies } from "./cookies.js";
import { setupPostMessageHandler } from "./post-message.js";

(async () => {
  const environment =
    document.head
      .querySelector("script#pocket-runtime")
      ?.getAttribute("data-env") === "server"
      ? "server"
      : "worker";

  if (process.env.NODE_ENV === "development") {
    if (environment === "server") {
      const eventSource = new EventSource("/_pocket/dev-events");

      eventSource.addEventListener("message", async () => {
        console.log("received message");
        eventSource.close();
        window.location.reload();
      });
    }
  }

  if (process.env.POCKET_DISABLE_WORKER) {
    const registrations =
      await window.navigator.serviceWorker?.getRegistrations();

    for (const registration of registrations) {
      registration.unregister();
    }
  } else if (window.navigator.serviceWorker) {
    await syncCookies();

    const registration = await window.navigator.serviceWorker.register(
      "/_pocket-worker.js",
      {
        scope: "/",
      }
    );

    console.log("env is", environment);
  }

  setupPostMessageHandler();
})();
