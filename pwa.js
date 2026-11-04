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


/* ===== AJUSTE PARA CELULAR (v1) =====
   Só atua em telas estreitas (celular). No computador nada muda. */
(function () {
  try {
    if (document.getElementById('sacramento-mobile-css')) return;
    var css = `
@media (max-width: 820px) {
  html, body { overflow-x: hidden !important; max-width: 100vw; -webkit-text-size-adjust: 100%; }
  body { padding-bottom: env(safe-area-inset-bottom); }
  /* Cabeçalho: marca em cima; busca e botões embaixo, quebrando linha */
  .site-header { position: static !important; flex-wrap: wrap !important; padding: 10px 12px !important; gap: 8px 10px !important; padding-top: calc(10px + env(safe-area-inset-top)) !important; }
  .site-header .site-brand { flex: 1 1 100% !important; min-width: 0 !important; gap: 10px !important; }
  .site-header .brand-info h1 { font-size: 13px !important; line-height: 1.2 !important; white-space: normal !important; }
  .site-header .search-global-box { order: 3; flex: 1 1 100% !important; max-width: none !important; margin: 0 !important; }
  .site-header .site-nav-right, .site-header .header-right, .site-header .nav-right { flex: 1 1 100% !important; flex-wrap: wrap !important; gap: 8px !important; justify-content: flex-start !important; }
  .site-header .empresa-selector, .site-header #seletorEmpresaCoreContainer { flex: 1 1 100% !important; max-width: 100% !important; }
  .site-header select { max-width: 100% !important; }
  .site-header #current_datetime, .site-header .data-hora, .site-header .relogio { display: none !important; }
  .site-header .site-nav-right > *, .site-header .header-right > * { flex: 0 0 auto; }
  .site-header .btn-acao-topo, .site-header .btn-topo-acao, .site-header .btn-modo-tema { padding: 6px 10px !important; font-size: 12px !important; }
  .site-header .user-box { font-size: 12px !important; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
  /* Conteúdo */
  .container, main, .main-content, .content, .wrap, .wrapper { width: 100% !important; max-width: 100% !important; padding-left: 12px !important; padding-right: 12px !important; margin-left: 0 !important; margin-right: 0 !important; }
  main, .container { padding-top: 14px !important; }
  h1 { font-size: 20px !important; }
  h2 { font-size: 17px !important; }
  /* Grades viram coluna única (ou 2 para indicadores) */
  .assistant-bubble { display: none !important; }
  .cards-grid, .form-grid, .grid, .grid-2, .grid-3, .grid-4, .row, .form-row, .filters, .filtros, .toolbar, .dash-grid, .stats-grid { grid-template-columns: 1fr !important; }
  .kpi-grid, .kpis, .cards-resumo, .summary-cards, .stat-cards, .dash-cards, .hub-grid, .fc-grid, .ficha-grid, .vinc-grid, .info-banco-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
  .toolbar, .form-row, .row, .filters, .filtros { flex-wrap: wrap !important; }
  [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
  [style*="display:flex"], [style*="display: flex"] { flex-wrap: wrap; }
  /* Campos: largura total e 16px (evita o zoom automático do iPhone) */
  input:not([type=checkbox]):not([type=radio]):not([type=file]), select, textarea { width: 100% !important; max-width: 100% !important; font-size: 16px !important; min-height: 42px; }
  .form-group, .campo, .field { min-width: 0 !important; width: 100% !important; flex: 1 1 100% !important; }
  /* Botões fáceis de tocar */
  button, .btn, a.btn { min-height: 40px; }
  /* Tabelas rolam para o lado dentro do próprio quadro */
  .tabela-scroll-mobile { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; max-width: 100%; }
  .tabela-scroll-mobile > table { min-width: 640px; }
  .card, .panel, .portal-card { max-width: 100% !important; }
  /* Janelas (modais) ocupam a tela */
  .modal-content, .modal-box, .modal, [class*="modal"] > div { max-width: 96vw !important; width: 96vw !important; max-height: 92vh !important; overflow-y: auto !important; }
  /* Barras de navegação de módulo rolam para o lado */
  .nav-modulo { overflow-x: auto; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; padding-bottom: 6px; }
  .nav-modulo a { white-space: nowrap; flex: 0 0 auto; }
  /* Botões flutuantes não cobrem o conteúdo */
  #sacramento-instalar { bottom: 76px !important; }
}
@media (max-width: 480px) {
  .kpi-grid, .kpis, .cards-resumo, .summary-cards, .stat-cards, .dash-cards, .hub-grid, .fc-grid, .ficha-grid, .vinc-grid, .info-banco-grid { grid-template-columns: 1fr !important; }
}`;
    var st = document.createElement('style'); st.id = 'sacramento-mobile-css'; st.textContent = css;
    (document.head || document.documentElement).appendChild(st);

    function envolverTabelas() {
      if (window.innerWidth > 820) return;
      document.querySelectorAll('table').forEach(function (t) {
        if (t.closest('.tabela-scroll-mobile') || t.closest('.print-corporative-header')) return;
        var w = document.createElement('div'); w.className = 'tabela-scroll-mobile';
        t.parentNode.insertBefore(w, t); w.appendChild(t);
      });
    }
    function iniciar() {
      envolverTabelas();
      try { new MutationObserver(envolverTabelas).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
  } catch (e) { /* ajuste de celular é opcional: nunca deve quebrar o sistema */ }
})();
