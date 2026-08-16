import { build, files, version } from '$service-worker';

const cacheName = `smash-log-${version}`;
const assetFiles = [...build, ...files];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(cacheName).then((cache) => {
			return cache.addAll(assetFiles);
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const cacheKeys = await caches.keys();

			await Promise.all(cacheKeys.filter((key) => key !== cacheName).map((key) => caches.delete(key)));
			await self.clients.claim();
		})()
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;

	if (request.method !== 'GET') return;

	if (request.mode === 'navigate') {
		event.respondWith(
			(async () => {
				try {
					const response = await fetch(request);
					const cache = await caches.open(cacheName);
					cache.put(request, response.clone());
					return response;
				} catch {
					return (await caches.match(request)) ?? (await caches.match('/')) ?? Response.error();
				}
			})()
		);

		return;
	}

	event.respondWith(
		(async () => {
			const cached = await caches.match(request);
			if (cached) return cached;

			try {
				const response = await fetch(request);
				const cache = await caches.open(cacheName);
				cache.put(request, response.clone());
				return response;
			} catch {
				return cached ?? Response.error();
			}
		})()
	);
});
