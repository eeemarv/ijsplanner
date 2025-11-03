/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;
const CACHE = `cache-${version}`;
const OFFLINE_URL = '/offline.html';
const ASSETS = new Set([...build, ...files, OFFLINE_URL]);

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache => cache.addAll(Array.from(ASSETS)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // We only want to handle navigation requests for an offline fallback
  if (event.request.mode !== 'navigate') {
    // For other requests (images, APIs), try cache first, then network
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => { // Make this an async function
      // If the network request fails (i.e., we are offline),
      // serve the cached offline page.
      const cachedResponse = await caches.match(OFFLINE_URL, { ignoreSearch: true });

      // Ensure the response is not undefined before returning it
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fallback if somehow even the offline page isn't cached
      // You could also throw an error or return a generic Error Response here
      return new Response("Offline page not found in cache.", { status: 503, statusText: "Service Unavailable" });
    })
  );
});