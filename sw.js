/* Sacramento ERP - Service Worker (v1)
   Regras de segurança:
   - NÃO guarda dados do sistema, nem páginas, nem respostas do Supabase.
   - Só guarda os ícones do aplicativo.
   - Tudo o mais vai sempre direto para a internet (dados sempre atualizados).
   - Se a internet cair, mostra um aviso simples em vez de uma tela de erro. */
const VERSAO = 'sacramento-erp-v1';
const ARQUIVOS = ['/icon-192.png', '/icon-512_1.png', '/icon-maskable-512_1.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase e outros sites: nunca interceptar

  if (ARQUIVOS.includes(url.pathname)) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req)));
    return;
  }

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => new Response(
        '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sem conexão</title></head>' +
        '<body style="font-family:Arial,sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center">' +
        '<div style="padding:24px"><img src="/icon-192.png" width="96" height="96" alt=""><h2>Sacramento ERP</h2>' +
        '<p>Sem conexão com a internet.<br>Por segurança, os dados não ficam guardados neste aparelho.</p>' +
        '<button onclick="location.reload()" style="padding:12px 20px;border:0;border-radius:8px;background:#2563eb;color:#fff;font-size:16px">Tentar novamente</button></div></body></html>',
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      ))
    );
  }
});
