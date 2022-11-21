(async () => {
  if (typeof window === "undefined" || !("serviceWorker" in window.navigator)) {
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
      await registration.update();
      window.location.reload();
    });
  }
})();

export type {};
