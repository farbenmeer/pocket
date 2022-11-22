(async () => {
  if (typeof window === "undefined" || !("serviceWorker" in window.navigator)) {
    return;
  }

  if (process.env.POCKET_DISABLE_WORKER) {
    const registrations =
      await window.navigator.serviceWorker.getRegistrations();

    for (const registration of registrations) {
      registration.unregister();
    }

    return;
  }

  const registration = await window.navigator.serviceWorker.register(
    "/_pocket-worker.js",
    {
      scope: "/",
    }
  );

  if (process.env.NODE_ENV === "development") {
    const eventSource = new EventSource("/_pocket/dev-events");

    eventSource.addEventListener("message", async () => {
      console.log("received message");
      eventSource.close();
      registration.unregister();
      window.location.reload();
    });
  }
})();

export type {};
