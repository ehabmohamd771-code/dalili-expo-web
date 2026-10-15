const CACHE_NAME = "dalili-cache-v1";
const APP_PREFIX = "/dalili-expo-web/";

self.addEventListener("install", (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return cache.addAll([
APP_PREFIX,
APP_PREFIX + "index.html",
APP_PREFIX + "manifest.webmanifest"
]);
}).then(() => self.skipWaiting())
);
});

self.addEventListener("activate", (event) => {
event.waitUntil(
caches.keys().then((keys) =>
Promise.all(
keys
.filter((key) => key !== CACHE_NAME)
.map((key) => caches.delete(key))
)
).then(() => self.clients.claim())
);
});

self.addEventListener("fetch", (event) => {
if (event.request.method !== "GET") return;

const url = new URL(event.request.url);

if (url.origin !== self.location.origin) return;

event.respondWith(
caches.match(event.request).then((cached) => {
if (cached) return cached;

  return fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();

      caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, copy);
      });
    }

    return response;
  }).catch(() => {
    if (event.request.mode === "navigate") {
      return caches.match(APP_PREFIX + "index.html");
    }

    throw new Error("أنت غير متصل بالإنترنت");
  });
})

);
});
