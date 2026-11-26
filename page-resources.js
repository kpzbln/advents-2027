(() => {
  function waitForImage(url) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        if (typeof image.decode === "function") {
          image.decode().catch(() => {}).then(resolve);
        } else {
          resolve();
        }
      };
      image.onerror = resolve;
      image.src = url;
    });
  }

  function ready(images, fonts = document.fonts?.ready, timeout = 5000) {
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, timeout);
      Promise.allSettled([fonts, ...images.map(waitForImage)]).then(() => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  globalThis.PageResources = Object.freeze({ ready });
})();
