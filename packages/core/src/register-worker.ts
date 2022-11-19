(() => {
  if (typeof window !== "undefined" && "serviceWorker" in window.navigator) {
    window.navigator.serviceWorker.register("/_pocket-worker.js", {
      scope: "/",
    });
  }
})();

export {};
