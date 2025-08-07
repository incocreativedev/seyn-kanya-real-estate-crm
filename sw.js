// Service Worker for Tyson Properties Real Estate CRM PWA
const CACHE_NAME = 'tyson-properties-crm-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/offline.html',
    '/images/icon-192.png',
    '/images/icon-512.png'
];

// API endpoints to cache
const API_CACHE_URLS = [
    '/.netlify/functions/clients',
    '/.netlify/functions/leads', 
    '/.netlify/functions/properties',
    '/.netlify/functions/reminders',
    '/.netlify/functions/comments'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                // Take control of all clients
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // If online, serve fresh content and cache it
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    // If offline, serve cached version or offline page
                    return caches.match(request)
                        .then(cachedResponse => {
                            return cachedResponse || caches.match(OFFLINE_URL);
                        });
                })
        );
        return;
    }

    // Handle API requests
    if (url.pathname.startsWith('/.netlify/functions/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache successful API responses
                    if (response.status === 200 && request.method === 'GET') {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    // Serve cached API response if available
                    if (request.method === 'GET') {
                        return caches.match(request)
                            .then(cachedResponse => {
                                if (cachedResponse) {
                                    // Add offline indicator to cached response
                                    return cachedResponse.json()
                                        .then(data => {
                                            data._offline = true;
                                            return new Response(JSON.stringify(data), {
                                                status: 200,
                                                statusText: 'OK (Cached)',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                }
                                            });
                                        });
                                }
                                // Return error response for uncached requests
                                return new Response(
                                    JSON.stringify({
                                        error: 'Offline - No cached data available',
                                        offline: true
                                    }),
                                    {
                                        status: 503,
                                        statusText: 'Service Unavailable',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        }
                                    }
                                );
                            });
                    }
                    
                    // For non-GET requests while offline
                    return new Response(
                        JSON.stringify({
                            error: 'Cannot perform this action while offline',
                            offline: true
                        }),
                        {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                })
        );
        return;
    }

    // Handle other requests (CSS, JS, images, etc.)
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(request)
                    .then(response => {
                        // Cache successful responses
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(request, responseClone));
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return offline page for uncached resources
                        if (request.destination === 'document') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync-crm') {
        event.waitUntil(
            // Handle background synchronization
            handleBackgroundSync()
        );
    }
});

// Push notification handler
self.addEventListener('push', event => {
    console.log('Push notification received:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'You have a new CRM notification',
        icon: '/images/icon-192.png',
        badge: '/images/icon-96.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'open',
                title: 'Open CRM',
                icon: '/images/icon-96.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/icon-96.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Tyson Properties CRM', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync handler
async function handleBackgroundSync() {
    try {
        // Check for offline actions stored in IndexedDB
        // This would sync any pending changes when back online
        console.log('Performing background sync...');
        
        // Example: Sync offline actions
        // const offlineActions = await getOfflineActions();
        // for (const action of offlineActions) {
        //     await syncAction(action);
        // }
        
        console.log('Background sync completed');
    } catch (error) {
        console.error('Background sync failed:', error);
        throw error;
    }
}