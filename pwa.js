if ("serviceWorker" in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController && !reloading) {
      reloading = true;
      window.location.reload();
    }
  });
  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }).catch(() => {});
    },
    { once: true },
  );
}
