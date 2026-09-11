// Uchiha da Bet - Service Worker para Notificações Push Mobile & Segundo Plano
const CACHE_NAME = 'uchiha-bet-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listener para mensagens da aplicação para exibir notificações nativas
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload;
    event.waitUntil(
      self.registration.showNotification(title, {
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [300, 100, 300, 100, 300],
        ...options,
      })
    );
  }
});

// Ao clicar na notificação na barra do celular
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se já existe uma janela aberta, foca nela
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não houver, abre nova janela
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Listener para push notifications externas (Web Push)
self.addEventListener('push', (event) => {
  let data = {
    title: '🔥 Uchiha da Bet — SINAL DETECTADO!',
    body: '⚡ Nova oportunidade validada pelo Motor de Regras!',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'uchiha-signal-alert',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon.svg',
      badge: data.badge || '/icon.svg',
      vibrate: data.vibrate || [300, 100, 300, 100, 300],
      tag: data.tag || 'uchiha-signal-alert',
      data: data.data || { url: '/' },
    })
  );
});
