/* Browser-only Web Push. No fetch handler, caches, or private notice payloads. */
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>event.waitUntil(self.registration.showNotification('Evolva Academy',{
 body:'Tienes nuevos avisos. Entra al campus para consultarlos.',
 icon:new URL('push-icon-192.png',self.registration.scope).href,
 badge:new URL('push-badge.png',self.registration.scope).href,
 tag:'evolva-campus-avisos',renotify:true,
 data:{url:new URL('./?seccion=avisos',self.registration.scope).href}
})));
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.openWindow(new URL('./?seccion=avisos',self.registration.scope).href));});
