/* ===== APLICATIVO INSTALÁVEL — PWA (v6.6) =====
   Liga o manifesto/ícones, registra o service worker e oferece o botão de instalar.
   Segurança: o service worker não guarda dados do sistema (só os ícones). */
(function () {
  try {
    var head = document.head || document.getElementsByTagName('head')[0];
    function addLink(rel, href, extra) {
      var l = document.createElement('link'); l.rel = rel; l.href = href;
      if (extra) for (var k in extra) l.setAttribute(k, extra[k]);
      head.appendChild(l);
    }
    function addMeta(name, content) {
      if (document.querySelector('meta[name="' + name + '"]')) return;
      var m = document.createElement('meta'); m.name = name; m.content = content; head.appendChild(m);
    }
    if (!document.querySelector('link[rel="manifest"]')) addLink('manifest', '/manifest.json');
    if (!document.querySelector('link[rel="apple-touch-icon"]')) addLink('apple-touch-icon', '/icon-512_1.png');
    if (!document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')) addLink('icon', '/icon-192.png', { type: 'image/png' });
    addMeta('theme-color', '#1e3a8a');
    addMeta('mobile-web-app-capable', 'yes');
    addMeta('apple-mobile-web-app-capable', 'yes');
    addMeta('apple-mobile-web-app-title', 'Sacramento ERP');
    addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    if (!document.querySelector('meta[name="viewport"]')) addMeta('viewport', 'width=device-width, initial-scale=1');

    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () {});
      });
    }

    var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    if (standalone) return; // já está rodando como aplicativo

    function lembrou() { try { return localStorage.getItem('sacramentoInstalarOculto') === '1'; } catch (e) { return false; } }
    function lembrar() { try { localStorage.setItem('sacramentoInstalarOculto', '1'); } catch (e) {} }

    function criarFaixa(html, aoClicar) {
      if (lembrou() || document.getElementById('sacramento-instalar')) return;
      var f = document.createElement('div');
      f.id = 'sacramento-instalar';
      f.setAttribute('style', 'position:fixed;left:16px;bottom:16px;z-index:999998;max-width:calc(100vw - 100px);background:#1e3a8a;color:#fff;border-radius:12px;padding:10px 12px;box-shadow:0 6px 20px rgba(0,0,0,.3);font:600 13px Inter,Arial,sans-serif;display:flex;align-items:center;gap:10px');
      f.innerHTML = '<span style="line-height:1.3">' + html + '</span>';
      if (aoClicar) {
        var b = document.createElement('button'); b.textContent = 'Instalar';
        b.setAttribute('style', 'border:0;border-radius:8px;background:#fbbf24;color:#0f172a;font-weight:700;padding:7px 12px;cursor:pointer');
        b.onclick = function () { aoClicar(); f.remove(); };
        f.appendChild(b);
      }
      var x = document.createElement('button'); x.textContent = '✕'; x.title = 'Não mostrar de novo';
      x.setAttribute('style', 'border:0;background:transparent;color:#cbd5e1;font-size:15px;cursor:pointer');
      x.onclick = function () { lembrar(); f.remove(); };
      f.appendChild(x);
      document.body.appendChild(f);
    }

    var promptInstalar = null;
    window.addEventListener('beforeinstallprompt', function (ev) {
      ev.preventDefault(); promptInstalar = ev;
      criarFaixa('Instale o <b>Sacramento ERP</b> como aplicativo', function () {
        promptInstalar.prompt();
        promptInstalar.userChoice.finally(function () { promptInstalar = null; });
      });
    });
    window.addEventListener('appinstalled', function () {
      var f = document.getElementById('sacramento-instalar'); if (f) f.remove(); lembrar();
    });

    // iPhone/iPad (Safari não oferece o botão automático)
    var ua = navigator.userAgent || '';
    var ios = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    if (ios) {
      window.addEventListener('load', function () {
        setTimeout(function () {
          criarFaixa('Para instalar: toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>', null);
        }, 2500);
      });
    }
  } catch (e) { /* o aplicativo é opcional: nunca deve quebrar o sistema */ }
})();
