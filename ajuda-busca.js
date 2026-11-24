/* ============================================================
   ajuda-busca.js — Busca inteligente e Ajuda do Sacramento ERP (v1.0)
   - Atalho Ctrl+K (ou "/" fora de campos) abre a busca em tela cheia
   - Acha telas, abas, "como fazer", dúvidas, prazos/normas e vídeos
   - Tolera erro de digitação, acento, plural e sinônimos
   - O conteúdo vem de ajuda-base.js (window.ERP_AJUDA); nada é enviado para fora
   - A busca do topo (erp-core.js / index.html) usa window.ERP_BUSCA.render()
   ============================================================ */
(function () {
  'use strict';
  if (window.ERP_BUSCA) return;

  var TIPOS = {
    tela:   { rot: 'Telas',                 ico: 'fa-window-maximize', ordem: 1 },
    aba:    { rot: 'Abas e funções',        ico: 'fa-layer-group',     ordem: 2 },
    como:   { rot: 'Como fazer',            ico: 'fa-list-check',      ordem: 0 },
    duvida: { rot: 'Dúvidas frequentes',    ico: 'fa-circle-question', ordem: 3 },
    norma:  { rot: 'Prazos e legislação',   ico: 'fa-scale-balanced',  ordem: 4 },
    video:  { rot: 'Vídeo-aulas',           ico: 'fa-circle-play',     ordem: 5 }
  };

  /* Sinônimos: quem digita o termo da esquerda também encontra os da direita */
  var SIN = {
    'demissao': ['rescisao', 'desligamento'], 'demitir': ['rescisao', 'desligamento'], 'desligamento': ['rescisao'],
    'salario': ['folha', 'holerite', 'pagamento'], 'contracheque': ['holerite', 'folha'], 'holerite': ['folha', 'contracheque'],
    'imposto': ['tributo', 'das', 'icms', 'iss', 'apuracao'], 'tributo': ['imposto', 'apuracao'],
    'nota': ['nf', 'nfe', 'nfse', 'fiscal', 'xml'], 'nf': ['nota', 'nfe', 'nfse'], 'nfe': ['nota', 'xml', 'fiscal'], 'nfse': ['nota', 'servico', 'fiscal'],
    'boleto': ['pagar', 'receber', 'titulo'], 'conta': ['titulo', 'lancamento'], 'despesa': ['pagar', 'gasto', 'conta'], 'gasto': ['despesa', 'pagar'],
    'receita': ['receber', 'faturamento', 'entrada'], 'cobrar': ['receber', 'faturamento'],
    'lucro': ['dividendos', 'distribuicao'], 'dividendo': ['lucro', 'distribuicao'], 'dividendos': ['lucro', 'distribuicao'],
    'extrato': ['ofx', 'conciliacao', 'banco'], 'ofx': ['extrato', 'conciliacao', 'banco'], 'conciliar': ['conciliacao', 'extrato'],
    'senha': ['usuario', 'login', 'acesso'], 'login': ['usuario', 'senha', 'acesso'], 'permissao': ['usuario', 'perfil', 'acesso'], 'acesso': ['usuario', 'permissao'],
    'funcionario': ['colaborador', 'empregado', 'folha', 'rh'], 'empregado': ['funcionario', 'folha'], 'colaborador': ['funcionario'],
    'ferias': ['folha', 'ferias13', 'descanso'], 'decimo': ['13', 'ferias13'], '13': ['decimo', 'ferias13'],
    'copia': ['backup'], 'seguranca': ['backup'], 'certificado': ['a1', 'a3', 'validade'],
    'imprimir': ['pdf', 'relatorio'], 'pdf': ['imprimir', 'relatorio'], 'planilha': ['csv', 'excel', 'importar', 'importacao'], 'excel': ['planilha', 'csv'],
    'cadastro': ['cadastrar', 'novo'], 'cadastrar': ['cadastro', 'novo', 'incluir'], 'incluir': ['novo', 'cadastrar', 'adicionar'],
    'excluir': ['apagar', 'remover'], 'apagar': ['excluir', 'remover'], 'editar': ['alterar', 'corrigir'], 'alterar': ['editar'],
    'reforma': ['ibs', 'cbs', 'tributaria', '2027'], 'cbs': ['reforma', 'ibs'], 'ibs': ['reforma', 'cbs'],
    'simples': ['das', 'pgdas', 'apuracao'], 'das': ['simples', 'pgdas', 'apuracao'],
    'pagamento': ['pagar', 'baixa'], 'baixa': ['pagamento', 'recebimento', 'liquidar'], 'recebimento': ['baixa', 'receber'],
    'contador': ['contabilidade', 'escritorio'], 'escritorio': ['contador', 'contabilidade'],
    'dominio': ['ecd', 'migrar', 'migracao', 'importar'], 'migrar': ['importar', 'dominio'], 'sped': ['ecd', 'efd'],
    'cliente': ['receber', 'parceiro'], 'fornecedor': ['pagar', 'parceiro'], 'socio': ['socios', 'lucro', 'prolabore'], 'prolabore': ['pro-labore', 'socio'],
    'transferir': ['transferencia'], 'caixa': ['fluxo', 'fechamento'], 'saldo': ['painel', 'caixa', 'extrato']
  };

  var PARADAS = { 'de': 1, 'do': 1, 'da': 1, 'dos': 1, 'das': 1, 'o': 1, 'a': 1, 'os': 1, 'as': 1, 'um': 1, 'uma': 1, 'no': 1, 'na': 1, 'em': 1, 'para': 1, 'por': 1, 'com': 1, 'que': 1, 'e': 1, 'ou': 1, 'eu': 1, 'meu': 1, 'minha': 1, 'se': 1, 'como': 1, 'onde': 1, 'qual': 1, 'quero': 1, 'preciso': 1, 'posso': 1, 'fazer': 1 };

  function sa(t) { return String(t == null ? '' : t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function tokens(t) { return sa(t).replace(/[^a-z0-9\-\s]/g, ' ').split(/\s+/).filter(function (x) { return x && !PARADAS[x]; }); }
  function raiz(t) { return t.length > 4 ? t.replace(/(oes|aes|ais|eis|es|s)$/, '') : t; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var p = [], i, j;
    for (j = 0; j <= b.length; j++) p[j] = j;
    for (i = 1; i <= a.length; i++) {
      var prev = p[0]; p[0] = i; var menor = p[0];
      for (j = 1; j <= b.length; j++) {
        var tmp = p[j];
        p[j] = Math.min(p[j] + 1, p[j - 1] + 1, prev + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
        prev = tmp; if (p[j] < menor) menor = p[j];
      }
      if (menor > max) return max + 1;
    }
    return p[b.length];
  }

  /* ---------- índice ---------- */
  var indice = null;
  function montarIndice() {
    if (indice) return indice;
    var base = window.ERP_AJUDA || [];
    indice = base.map(function (e, n) {
      var t = tokens(e.titulo), k = tokens((e.palavras || []).join(' ')), c = tokens((e.resumo || '') + ' ' + (e.passos || []).join(' ') + ' ' + (e.modulo || ''));
      return { e: e, n: n, t: t, k: k, c: c, ts: sa(e.titulo) };
    });
    return indice;
  }

  function casa(tok, lista) { /* melhor correspondência de 1 termo numa lista: 3 exato, 2 prefixo/raiz, 1 aproximado, 0 nenhum */
    var r = raiz(tok), melhor = 0;
    for (var i = 0; i < lista.length; i++) {
      var w = lista[i];
      if (w === tok) return 3;
      var rw = raiz(w);
      if (rw === r) { melhor = Math.max(melhor, 3); continue; }
      if (tok.length >= 3 && (w.indexOf(tok) === 0 || (r.length >= 4 && rw.indexOf(r) === 0))) { melhor = Math.max(melhor, 2); continue; }
      if (tok.length >= 5) {
        var lim = tok.length >= 8 ? 2 : 1;
        if (lev(tok, w, lim) <= lim) melhor = Math.max(melhor, 1);
      }
    }
    return melhor;
  }

  function pontuar(item, toks) {
    var total = 0;
    for (var i = 0; i < toks.length; i++) {
      var tk = toks[i], alt = [tk].concat((SIN[tk] || []).slice(0, 4)), ganho = 0;
      for (var a = 0; a < alt.length; a++) {
        var pes = a === 0 ? 1 : 0.55;
        var g = Math.max(casa(alt[a], item.t) * 5, casa(alt[a], item.k) * 3, casa(alt[a], item.c) * 1) * pes;
        if (g > ganho) ganho = g;
      }
      if (ganho === 0) return 0; /* todo termo digitado precisa aparecer em algum lugar */
      total += ganho;
    }
    var q = toks.join(' ');
    if (item.ts.indexOf(sa(q)) > -1) total += 6;
    if (item.e.url && paginaAtual() === item.e.url.split('#')[0].split('/').pop()) total += 1.5; /* leve preferência pela tela em que o usuário está */
    return total;
  }

  function paginaAtual() { return (location.pathname.split('/').pop() || 'index.html').toLowerCase(); }

  function buscar(q, limite) {
    var toks = tokens(q); if (!toks.length) return [];
    var res = [];
    montarIndice().forEach(function (it) { var p = pontuar(it, toks); if (p > 0) res.push({ it: it.e, p: p, n: it.n }); });
    res.sort(function (a, b) { return b.p - a.p || ((TIPOS[a.it.tipo] || {}).ordem || 9) - ((TIPOS[b.it.tipo] || {}).ordem || 9) || a.n - b.n; });
    return res.slice(0, limite || 30);
  }

  function ajudaDaTela() {
    var pg = paginaAtual(), arr = [];
    (window.ERP_AJUDA || []).forEach(function (e) { if (e.url && e.url.split('#')[0].split('/').pop().toLowerCase() === pg && e.tipo !== 'tela') arr.push(e); });
    arr.sort(function (a, b) { return ((TIPOS[a.tipo] || {}).ordem || 9) - ((TIPOS[b.tipo] || {}).ordem || 9); });
    return arr;
  }

  /* ---------- recentes (só neste navegador) ---------- */
  function lerRec() { try { return JSON.parse(localStorage.getItem('erp_busca_recentes') || '[]') || []; } catch (e) { return []; } }
  function gravarRec(id) { try { var r = lerRec().filter(function (x) { return x !== id; }); r.unshift(id); localStorage.setItem('erp_busca_recentes', JSON.stringify(r.slice(0, 6))); } catch (e) {} }
  function porId(id) { var b = window.ERP_AJUDA || []; for (var i = 0; i < b.length; i++) if (b[i].id === id) return b[i]; return null; }

  /* ---------- desenho ---------- */
  function linha(e, q) {
    var T = TIPOS[e.tipo] || TIPOS.tela;
    var temArtigo = (e.passos && e.passos.length) || e.resumo;
    var acao = (e.tipo === 'como' || e.tipo === 'duvida' || e.tipo === 'norma') ? 'artigo' : 'ir';
    return '<a href="' + esc(e.url || '#') + '" class="eb-item" data-id="' + esc(e.id) + '" data-acao="' + acao + '">' +
      '<span class="eb-ic"><i class="fas ' + T.ico + '"></i></span>' +
      '<span class="eb-tx"><b>' + esc(e.titulo) + '</b>' +
      '<small>' + esc(e.modulo ? e.modulo + ' · ' : '') + T.rot + (temArtigo && acao === 'ir' && e.resumo ? ' — ' + esc(String(e.resumo).slice(0, 70)) : '') + '</small></span>' +
      (e.video ? '<span class="eb-v" title="Tem vídeo-aula"><i class="fas fa-circle-play"></i></span>' : '') + '</a>';
  }

  function agrupar(res, q) {
    var grupos = {}, ordem = [];
    res.forEach(function (r) { var t = r.it.tipo; if (!grupos[t]) { grupos[t] = []; ordem.push(t); } grupos[t].push(r.it); });
    ordem.sort(function (a, b) { /* o grupo do melhor resultado vem primeiro; o resto na ordem padrão */ return (TIPOS[a].ordem) - (TIPOS[b].ordem); });
    var topo = res.length ? res[0].it.tipo : null;
    if (topo) { ordem = [topo].concat(ordem.filter(function (t) { return t !== topo; })); }
    return ordem.map(function (t) {
      return '<div class="eb-gr">' + TIPOS[t].rot + '</div>' + grupos[t].slice(0, t === 'tela' ? 6 : 5).map(function (e) { return linha(e, q); }).join('');
    }).join('');
  }

  function artigo(e) {
    var h = '<div class="eb-art"><button type="button" class="eb-volta" data-acao="volta"><i class="fas fa-arrow-left"></i> Voltar aos resultados</button>' +
      '<h3>' + esc(e.titulo) + '</h3>' + (e.modulo ? '<div class="eb-mod">' + esc(e.modulo) + '</div>' : '');
    if (e.resumo) h += '<p class="eb-res">' + esc(e.resumo) + '</p>';
    if (e.passos && e.passos.length) h += '<ol class="eb-passos">' + e.passos.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol>';
    if (e.dica) h += '<div class="eb-dica"><i class="fas fa-lightbulb"></i> ' + esc(e.dica) + '</div>';
    if (e.fonte) h += '<div class="eb-fonte">Fonte: ' + esc(e.fonte) + (e.revisado ? ' · conferido em ' + esc(e.revisado) : '') + '</div>';
    h += '<div class="eb-acoes">' + (e.url ? '<a class="eb-btn" href="' + esc(e.url) + '"><i class="fas fa-arrow-right"></i> Ir para a tela</a>' : '') +
      (e.video ? '<a class="eb-btn eb-sec" href="tutoriais.html#' + esc(e.video) + '"><i class="fas fa-circle-play"></i> Ver a vídeo-aula</a>' : '') + '</div></div>';
    return h;
  }

  /* ---------- API usada pela busca do topo ---------- */
  function renderTopo(q, dropdown) {
    var res = buscar(q, 12);
    var h = '';
    if (!res.length) {
      h = '<div class="search-dropdown-header">Resultados</div><div class="search-item" style="color:#64748b;">Nada encontrado para "' + esc(q) + '".</div>';
    } else {
      h = '<div class="search-dropdown-header">Resultados</div>' + res.slice(0, 8).map(function (r) {
        var T = TIPOS[r.it.tipo] || TIPOS.tela;
        var href = (r.it.tipo === 'como' || r.it.tipo === 'duvida' || r.it.tipo === 'norma') ? '#' : (r.it.url || '#');
        return '<a href="' + esc(href) + '" class="search-item" data-eb-id="' + esc(r.it.id) + '"><i class="fas ' + T.ico + '"></i> <span>' + esc(r.it.titulo) + ' <small style="color:#94a3b8;">· ' + T.rot + '</small></span></a>';
      }).join('');
    }
    h += '<a href="#" class="search-item" data-eb-abrir="1" style="color:#2563eb;font-weight:600;"><i class="fas fa-magnifying-glass-plus"></i> <span>Abrir busca completa (Ctrl+K)</span></a>';
    dropdown.innerHTML = h;
    dropdown.style.display = 'block';
    Array.prototype.forEach.call(dropdown.querySelectorAll('a[data-eb-id]'), function (a) {
      a.addEventListener('click', function (ev) {
        var e = porId(a.getAttribute('data-eb-id')); if (!e) return; gravarRec(e.id);
        if (e.tipo === 'como' || e.tipo === 'duvida' || e.tipo === 'norma') { ev.preventDefault(); dropdown.style.display = 'none'; abrir(q, e.id); }
      });
    });
    var ab = dropdown.querySelector('a[data-eb-abrir]');
    if (ab) ab.addEventListener('click', function (ev) { ev.preventDefault(); dropdown.style.display = 'none'; abrir(q); });
  }

  /* ---------- painel em tela cheia ---------- */
  var css = '#ebFundo{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:99990;display:none;align-items:flex-start;justify-content:center;padding:8vh 12px 12px}' +
    '#ebFundo.aberto{display:flex}' +
    '#ebCaixa{background:#fff;width:100%;max-width:680px;max-height:80vh;border-radius:14px;box-shadow:0 25px 60px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden;font-family:Inter,Segoe UI,Arial,sans-serif}' +
    '#ebTopo{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #e2e8f0}' +
    '#ebTopo i{color:#2563eb}#ebEntrada{flex:1;border:none;outline:none;font-size:16px;color:#0f172a;background:transparent}' +
    '#ebTopo kbd{font-size:11px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:2px 6px;color:#64748b}' +
    '#ebCorpo{overflow:auto;padding:6px 8px 10px;flex:1}' +
    '.eb-gr{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em;padding:10px 10px 4px}' +
    '.eb-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;text-decoration:none;color:#0f172a;cursor:pointer}' +
    '.eb-item:hover,.eb-item.sel{background:#eff6ff}' +
    '.eb-ic{width:30px;height:30px;border-radius:8px;background:#dbeafe;color:#1d4ed8;display:flex;align-items:center;justify-content:center;font-size:13px;flex:none}' +
    '.eb-tx{display:flex;flex-direction:column;min-width:0;flex:1}.eb-tx b{font-size:14px;font-weight:600}.eb-tx small{font-size:11.5px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.eb-v{color:#dc2626;font-size:15px}' +
    '.eb-vazio{padding:26px 14px;text-align:center;color:#64748b;font-size:14px}.eb-vazio a,.eb-vazio button{color:#2563eb;font-weight:600;background:none;border:none;cursor:pointer;font-size:14px;text-decoration:underline}' +
    '#ebRodape{border-top:1px solid #e2e8f0;padding:8px 14px;font-size:11.5px;color:#64748b;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}' +
    '.eb-art{padding:10px 12px 14px}.eb-art h3{font-size:18px;color:#0f172a;margin:8px 0 2px}.eb-mod{font-size:11.5px;color:#2563eb;font-weight:700;text-transform:uppercase;margin-bottom:8px}' +
    '.eb-res{font-size:14px;color:#334155;line-height:1.5;margin:6px 0 10px}.eb-passos{padding-left:22px;font-size:14px;color:#1e293b;line-height:1.55}.eb-passos li{margin:5px 0}' +
    '.eb-dica{background:#fefce8;border:1px solid #fde047;color:#854d0e;border-radius:8px;padding:9px 11px;font-size:13px;margin-top:12px}' +
    '.eb-fonte{font-size:11.5px;color:#64748b;margin-top:10px}' +
    '.eb-acoes{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.eb-btn{background:#2563eb;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:8px 14px;border-radius:8px}.eb-btn.eb-sec{background:#fff;color:#2563eb;border:1px solid #93c5fd}' +
    '.eb-volta{background:none;border:none;color:#2563eb;font-weight:600;cursor:pointer;font-size:13px;padding:4px 2px}' +
    'body.dark-mode #ebCaixa{background:#1e293b}body.dark-mode #ebEntrada,body.dark-mode .eb-item,body.dark-mode .eb-art h3{color:#f1f5f9}body.dark-mode .eb-item:hover,body.dark-mode .eb-item.sel{background:#334155}' +
    '@media print{#ebFundo{display:none !important}}';

  var montado = false, estado = { q: '', sel: -1 };
  function montar() {
    if (montado) return; montado = true;
    var st = document.createElement('style'); st.id = 'ebCss'; st.textContent = css; document.head.appendChild(st);
    if (!document.querySelector('link[href*="font-awesome"]')) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'; document.head.appendChild(l); }
    var f = document.createElement('div'); f.id = 'ebFundo';
    f.innerHTML = '<div id="ebCaixa" role="dialog" aria-label="Busca e ajuda"><div id="ebTopo"><i class="fas fa-magnifying-glass"></i>' +
      '<input id="ebEntrada" type="text" autocomplete="off" data-lpignore="true" data-1p-ignore name="busca_ajuda_sacramento" placeholder="O que você quer fazer? Ex.: lançar conta a pagar, rescisão, importar XML...">' +
      '<kbd>Esc</kbd></div><div id="ebCorpo"></div>' +
      '<div id="ebRodape"><span>↑ ↓ navegar · Enter abrir · Esc fechar</span><span><a href="central_ajuda.html" style="color:#2563eb">Central de Ajuda</a> · <a href="tutoriais.html" style="color:#2563eb">Vídeo-aulas</a></span></div></div>';
    document.body.appendChild(f);
    f.addEventListener('mousedown', function (ev) { if (ev.target === f) fechar(); });
    var inp = document.getElementById('ebEntrada');
    inp.addEventListener('input', function () { estado.q = inp.value; estado.sel = -1; desenhar(); });
    inp.addEventListener('keydown', teclas);
    document.getElementById('ebCorpo').addEventListener('click', function (ev) {
      var v = ev.target.closest('[data-acao="volta"]'); if (v) { desenhar(); return; }
      var a = ev.target.closest('a.eb-item'); if (a) { var e = porId(a.getAttribute('data-id')); if (e) gravarRec(e.id); if (a.getAttribute('data-acao') === 'artigo') { ev.preventDefault(); mostrarArtigo(e); } return; }
      var p = ev.target.closest('[data-pergunta]'); if (p) { fechar(); var b = document.getElementById('assistenteIaBotao') || document.querySelector('button[title="Central de Ajuda"]'); if (b) b.click(); }
    });
  }

  function mostrarArtigo(e) { document.getElementById('ebCorpo').innerHTML = artigo(e); document.getElementById('ebCorpo').scrollTop = 0; }

  function desenhar() {
    var corpo = document.getElementById('ebCorpo'), q = estado.q.trim();
    if (!q) {
      var h = '', tela = ajudaDaTela().slice(0, 6), rec = lerRec().map(porId).filter(Boolean);
      if (tela.length) h += '<div class="eb-gr">Ajuda desta tela</div>' + tela.map(function (e) { return linha(e, ''); }).join('');
      if (rec.length) h += '<div class="eb-gr">Vistos recentemente</div>' + rec.map(function (e) { return linha(e, ''); }).join('');
      if (!h) h = '<div class="eb-vazio">Digite o que você quer fazer. Exemplos: <b>pagar fornecedor</b>, <b>emitir holerite</b>, <b>importar XML</b>, <b>reforma tributária</b>.</div>';
      corpo.innerHTML = h; return;
    }
    var res = buscar(q, 40);
    if (!res.length) {
      corpo.innerHTML = '<div class="eb-vazio">Não achei nada para "<b>' + esc(q) + '</b>".<br>Tente outras palavras (ex.: "pagar" em vez de "quitar") ou <button type="button" data-pergunta="1">pergunte ao Assistente</button>.</div>';
      return;
    }
    corpo.innerHTML = agrupar(res, q) + '<div class="eb-vazio" style="padding:12px">Não era isso? <button type="button" data-pergunta="1">Pergunte ao Assistente</button></div>';
  }

  function teclas(ev) {
    var itens = Array.prototype.slice.call(document.querySelectorAll('#ebCorpo a.eb-item'));
    if (ev.key === 'Escape') { fechar(); return; }
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault(); if (!itens.length) return;
      estado.sel = (estado.sel + (ev.key === 'ArrowDown' ? 1 : -1) + itens.length) % itens.length;
      itens.forEach(function (a, i) { a.classList.toggle('sel', i === estado.sel); });
      if (itens[estado.sel]) itens[estado.sel].scrollIntoView({ block: 'nearest' });
    } else if (ev.key === 'Enter') {
      var alvo = itens[estado.sel >= 0 ? estado.sel : 0]; if (alvo) { ev.preventDefault(); alvo.click(); }
    }
  }

  function abrir(q, idArtigo) {
    montar();
    var f = document.getElementById('ebFundo'), inp = document.getElementById('ebEntrada');
    f.classList.add('aberto'); estado.q = q || ''; estado.sel = -1; inp.value = estado.q; desenhar();
    if (idArtigo) { var e = porId(idArtigo); if (e) mostrarArtigo(e); }
    setTimeout(function () { inp.focus(); inp.select(); }, 30);
  }
  function fechar() { var f = document.getElementById('ebFundo'); if (f) f.classList.remove('aberto'); }

  document.addEventListener('keydown', function (ev) {
    var tag = (ev.target && ev.target.tagName || '').toLowerCase(), digitando = tag === 'input' || tag === 'textarea' || tag === 'select' || (ev.target && ev.target.isContentEditable);
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'k' || ev.key === 'K')) { ev.preventDefault(); abrir(); }
    else if (ev.key === '/' && !digitando && !ev.ctrlKey && !ev.metaKey && !ev.altKey) { ev.preventDefault(); abrir(); }
    else if (ev.key === 'Escape') fechar();
  });

  /* Link com #aba (vindo da busca) abre a aba certa da tela */
  function abrirAbaDoHash() {
    try {
      var h = (location.hash || '').replace('#', ''); if (!h || typeof window.mudarAba !== 'function') return;
      var ok = (window.ERP_AJUDA || []).some(function (e) { return e.tipo === 'aba' && e.url && e.url.toLowerCase() === (paginaAtual() + '#' + h).toLowerCase(); });
      if (ok) window.mudarAba(h);
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(abrirAbaDoHash, 700); }); else setTimeout(abrirAbaDoHash, 700);
  window.addEventListener('hashchange', abrirAbaDoHash);

  window.ERP_BUSCA = { buscar: buscar, abrir: abrir, fechar: fechar, render: renderTopo, ajudaDaTela: ajudaDaTela, versao: '1.0' };
})();
