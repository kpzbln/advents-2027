importScripts("./app-config.js", "./offline-assets.js");

const CACHE_PREFIX = "advents-";
const CACHE_NAME = globalThis.AdventAppConfig.cacheName;
const APP_SHELL = [
  "./",
  "./index.html",
  "./app-config.js",
  "./main-page.css",
  "./main-page.js",
  "./calendar-state.js",
  "./calendar-controller.js",
  "./calendar-data.js",
  "./page-resources.js",
  "./modal-dialog.js",
  "./pwa.js",
  "./offline-assets.js",
  "./advent-hello-kitty.html",
  "./advent-hello-kitty.css",
  "./advent-hello-kitty.js",
  "./advent-payot.html",
  "./advent-payot.css",
  "./advent-payot.js",
  "./advent-kinder.html",
  "./advent-kinder.css",
  "./advent-kinder.js",
  "./manifest.webmanifest",
  ...self.ADVENT_IMAGE_ASSETS,
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // A successful first installation also makes all gift images available offline.
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function storeResponse(cache, request, response) {
  if (response.ok && response.type !== "opaque") {
    // Cache quota/write failures must not turn a successful response into a failure.
    await cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function handleRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: request.mode === "navigate" });
  const isImage = request.destination === "image" || /\.(webp|avif|png|svg)$/.test(new URL(request.url).pathname);
  if (isImage && cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(request, { signal: controller.signal });
    if (!response.ok && cached) return cached;
    return await storeResponse(cache, request, response);
  } catch {
    if (cached) return cached;
    return new Response(request.mode === "navigate"
      ? '<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Нет подключения</title><p>Подключитесь к интернету, чтобы загрузить эту страницу.</p></html>'
      : "Offline", {
      status: 503,
      headers: { "Content-Type": request.mode === "navigate" ? "text/html; charset=utf-8" : "text/plain; charset=utf-8" },
    });
  } finally {
    clearTimeout(timer);
  }
}

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== "GET" || requestUrl.origin !== self.location.origin) return;
  event.respondWith(handleRequest(event.request));
});
