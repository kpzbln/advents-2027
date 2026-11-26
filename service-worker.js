const CACHE_NAME = "advents-2027-v15";
const APP_SHELL = [
  "./",
  "./index.html",
  "./main-page.css",
  "./main-page.js",
  "./advent-hello-kitty.html",
  "./advent-hello-kitty.css",
  "./advent-hello-kitty.js",
  "./advent-payot.html",
  "./advent-payot.css",
  "./advent-payot.js",
  "./img/advent-payot/calendar-progress.png",
  "./img/advent-payot/current-date.png",
  "./img/advent-payot/next-unlock.png",
  "./manifest.webmanifest",
  "./img/pwa/icon-192.webp",
  "./img/pwa/icon-512.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        const responseCopy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseCopy);
        });
        return networkResponse;
      });
    }),
  );
});
