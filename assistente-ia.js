/* ============================================================
   assistente-ia.js — Assistente de ajuda do Sacramento ERP
   - Abre ao clicar no botão azul de interrogação (canto inferior direito)
   - Responde só dúvidas de COMO USAR o sistema; não envia dados da empresa
   - A conversa passa pela função segura "assistente_index-ts" no Supabase
   ============================================================ */
(function () {
  'use strict';
  if (window.__assistenteIaCarregado) return;
  window.__assistenteIaCarregado = true;

  var pagina = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (pagina === 'login.html' || pagina === 'central_ajuda.html') return;

  var URL_FUNCAO = 'https://vcuhkvqrbkyulnnyqnbf.supabase.co/functions/v1/assistente_index-ts';
  var CHAVE_PUBLICA = 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei';
  var CHAVE_SESSAO = 'assistente_conversa_v1';
  var conversa = [];
  var enviando = false;

  try { conversa = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || '[]') || []; } catch (e) { conversa = []; }

  function salvar() { try { sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(conversa.slice(-20))); } catch (e) {} }

  function css() {
    if (document.getElementById('assistenteIaCss')) return;
    var st = document.createElement('style');
    st.id = 'assistenteIaCss';
    st.textContent =
      '#assistenteIaPainel{position:fixed;right:24px;bottom:88px;width:370px;max-width:calc(100vw - 24px);height:500px;max-height:calc(100vh - 110px);background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 18px 48px rgba(15,23,42,.28);z-index:1000000;display:none;flex-direction:column;overflow:hidden;font-family:Inter,Arial,sans-serif;color:#0f172a}' +
      '#assistenteIaPainel.aberto{display:flex}' +
      '#assistenteIaPainel .ai-topo{background:#1e3a8a;color:#fff;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px}' +
      '#assistenteIaPainel .ai-topo b{font-size:14px}' +
      '#assistenteIaPainel .ai-topo small{display:block;font-size:10.5px;color:#bfdbfe;font-weight:500}' +
      '#assistenteIaPainel .ai-topo button{background:rgba(255,255,255,.15);border:none;color:#fff;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:14px}' +
      '#assistenteIaPainel .ai-aviso{background:#fef3c7;color:#78350f;font-size:11px;font-weight:600;padding:7px 12px;line-height:1.35}' +
      '#assistenteIaPainel .ai-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#f8fafc}' +
      '#assistenteIaPainel .ai-m{max-width:88%;padding:9px 12px;border-radius:12px;font-size:13px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}' +
      '#assistenteIaPainel .ai-u{align-self:flex-end;background:#2563eb;color:#fff;border-bottom-right-radius:4px}' +
      '#assistenteIaPainel .ai-a{align-self:flex-start;background:#fff;border:1px solid #e2e8f0;border-bottom-left-radius:4px}' +
      '#assistenteIaPainel .ai-e{align-self:flex-start;background:#fee2e2;color:#991b1b;border:1px solid #fecaca}' +
      '#assistenteIaPainel .ai-sug{display:flex;flex-wrap:wrap;gap:6px}' +
      '#assistenteIaPainel .ai-sug button{background:#fff;border:1px solid #bfdbfe;color:#1d4ed8;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:600;cursor:pointer}' +
      '#assistenteIaPainel .ai-sug button:hover{background:#eff6ff}' +
      '#assistenteIaPainel .ai-form{display:flex;gap:8px;padding:10px;border-top:1px solid #e2e8f0;background:#fff}' +
      '#assistenteIaPainel .ai-form input{flex:1;height:38px;border:1px solid #cbd5e1;border-radius:10px;padding:0 12px;font-size:13px;outline:none;color:#0f172a;background:#fff}' +
      '#assistenteIaPainel .ai-form input:focus{border-color:#2563eb}' +
      '#assistenteIaPainel .ai-form button{background:#2563eb;color:#fff;border:none;border-radius:10px;padding:0 14px;font-weight:700;cursor:pointer}' +
      '#assistenteIaPainel .ai-form button:disabled{opacity:.5;cursor:not-allowed}' +
      '#assistenteIaPainel .ai-rodape{padding:6px 12px 9px;font-size:11px;text-align:center;background:#fff}' +
      '#assistenteIaPainel .ai-rodape a{color:#2563eb;font-weight:700;text-decoration:none}' +
      '@media print{#assistenteIaPainel{display:none !important}}';
    document.head.appendChild(st);
  }

  function montar() {
    if (document.getElementById('assistenteIaPainel')) return;
    css();
    var p = document.createElement('div');
    p.id = 'assistenteIaPainel';
    p.className = 'ocultar-print no-print';
    p.innerHTML =
      '<div class="ai-topo"><div><b>Assistente Sacramento</b><small>Tira dúvidas de como usar o sistema</small></div><button type="button" id="aiFechar" title="Fechar">&times;</button></div>' +
      '<div class="ai-aviso">Não digite CNPJ, CPF, valores, senhas ou nomes de clientes. O assistente não vê os dados da sua empresa.</div>' +
      '<div class="ai-msgs" id="aiMsgs"></div>' +
      '<form class="ai-form" id="aiForm" autocomplete="off"><input type="text" id="aiEntrada" maxlength="600" placeholder="Digite sua dúvida..."><button type="submit" id="aiEnviar">Enviar</button></form>' +
      '<div class="ai-rodape"><a href="central_ajuda.html">Ver tutoriais na Central de Ajuda</a></div>';
    document.body.appendChild(p);
    document.getElementById('aiFechar').onclick = fechar;
    document.getElementById('aiForm').onsubmit = function (e) { e.preventDefault(); enviar(document.getElementById('aiEntrada').value); };
    desenhar();
  }

  function bolha(texto, classe) {
    var d = document.createElement('div');
    d.className = 'ai-m ' + classe;
    d.textContent = texto;
    return d;
  }

  function desenhar() {
    var area = document.getElementById('aiMsgs');
    if (!area) return;
    area.innerHTML = '';
    if (!conversa.length) {
      area.appendChild(bolha('Olá! Sou o assistente do Sacramento ERP. Posso explicar onde fica cada tela e como usar. Experimente uma pergunta:', 'ai-a'));
      var sug = document.createElement('div');
      sug.className = 'ai-sug';
      ['Como emitir um recibo RPA?', 'Onde faço a conciliação OFX?', 'Como imprimir um relatório?', 'Como cadastrar um centro de custo?'].forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = t;
        b.onclick = function () { enviar(t); };
        sug.appendChild(b);
      });
      area.appendChild(sug);
    }
    conversa.forEach(function (m) { area.appendChild(bolha(m.texto, m.papel === 'usuario' ? 'ai-u' : (m.erro ? 'ai-e' : 'ai-a'))); });
    area.scrollTop = area.scrollHeight;
  }

  function abrir() {
    montar();
    document.getElementById('assistenteIaPainel').classList.add('aberto');
    var i = document.getElementById('aiEntrada'); if (i) i.focus();
  }
  function fechar() {
    var p = document.getElementById('assistenteIaPainel');
    if (p) p.classList.remove('aberto');
  }

  async function enviar(texto) {
    texto = String(texto || '').trim();
    if (!texto || enviando) return;
    enviando = true;
    var entrada = document.getElementById('aiEntrada'), btn = document.getElementById('aiEnviar');
    if (entrada) entrada.value = '';
    if (btn) btn.disabled = true;
    conversa.push({ papel: 'usuario', texto: texto.slice(0, 600) });
    var area = document.getElementById('aiMsgs');
    desenhar();
    var espera = bolha('Pensando...', 'ai-a'); espera.id = 'aiEspera';
    if (area) { area.appendChild(espera); area.scrollTop = area.scrollHeight; }
    try {
      var cli = window.sb;
      var sessao = cli && cli.auth ? (await cli.auth.getSession()).data.session : null;
      if (!sessao) throw new Error('Sessão expirada. Entre novamente no sistema.');
      var ctl = new AbortController();
      var tm = setTimeout(function () { ctl.abort(); }, 30000);
      var enviadas = conversa.filter(function (m) { return !m.erro; }).slice(-8).map(function (m) { return { papel: m.papel, texto: m.texto }; });
      var r = await fetch(URL_FUNCAO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sessao.access_token, 'apikey': CHAVE_PUBLICA },
        body: JSON.stringify({ mensagens: enviadas }),
        signal: ctl.signal
      });
      clearTimeout(tm);
      var j = null; try { j = await r.json(); } catch (e) {}
      if (!r.ok || !j || !j.resposta) throw new Error((j && j.erro) || 'Não consegui falar com o assistente agora.');
      conversa.push({ papel: 'assistente', texto: j.resposta });
    } catch (e) {
      var msg = (e && e.name === 'AbortError') ? 'Demorou demais para responder. Tente novamente.' : (e && e.message ? e.message : 'Erro ao falar com o assistente.');
      conversa.push({ papel: 'assistente', texto: msg, erro: true });
    }
    enviando = false;
    salvar();
    desenhar();
    if (btn) btn.disabled = false;
    var i2 = document.getElementById('aiEntrada'); if (i2) i2.focus();
  }

  // Intercepta o botão azul de interrogação (Central de Ajuda) em todas as telas
  document.addEventListener('click', function (e) {
    var alvo = e.target && e.target.closest ? e.target.closest('button[title="Central de Ajuda"]') : null;
    if (!alvo) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var p = document.getElementById('assistenteIaPainel');
    if (p && p.classList.contains('aberto')) fechar(); else abrir();
  }, true);
})();
