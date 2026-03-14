const CACHE = "mealplan-v1"
const STATIC = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
]

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (e) => {
  // Only handle same-origin GET requests
  if (e.request.method !== "GET") return
  if (!e.request.url.startsWith(self.location.origin)) return

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache successful responses for static assets
        if (res.ok && (e.request.url.match(/\.(png|jpg|svg|webp|woff2|css|js)$/))) {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, clone))
        }
        return res
      })
      .catch(() =>
        // Offline fallback — return cached version if available
        caches.match(e.request).then((cached) => cached ?? caches.match("/"))
      )
  )
})
