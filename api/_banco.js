// Biblioteca interna das conexoes bancarias (nao e uma rota: arquivos com _ no inicio nao viram endereco).
const crypto = require('crypto');
const https = require('https');
const { URL } = require('url');

function env(n) { return process.env[n]; }

/* ---------- criptografia dos segredos (AES-256-GCM) ---------- */
function chave() {
  // Chave de criptografia: usa BANCO_CRYPTO_KEY (32 bytes em base64) se existir; senao deriva da chave de servico do Supabase,
  // que so existe no servidor. Assim o navegador e o banco de dados, sozinhos, nunca conseguem abrir os segredos.
  const k = Buffer.from(env('BANCO_CRYPTO_KEY') || '', 'base64');
  if (k.length === 32) return k;
  const base = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!base || base.length < 20) throw new Error('Servidor sem a chave de serviço do Supabase configurada.');
  return crypto.createHash('sha256').update('banco-conexoes:v1:' + base).digest();
}
function cifrar(txt, aad) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', chave(), iv);
  c.setAAD(Buffer.from(String(aad)));
  const enc = Buffer.concat([c.update(String(txt), 'utf8'), c.final()]);
  return 'v1:' + iv.toString('base64') + ':' + c.getAuthTag().toString('base64') + ':' + enc.toString('base64');
}
function decifrar(s, aad) {
  const p = String(s || '').split(':');
  if (p[0] !== 'v1' || p.length !== 4) throw new Error('Segredo guardado em formato inválido.');
  const d = crypto.createDecipheriv('aes-256-gcm', chave(), Buffer.from(p[1], 'base64'));
  d.setAAD(Buffer.from(String(aad)));
  d.setAuthTag(Buffer.from(p[2], 'base64'));
  return Buffer.concat([d.update(Buffer.from(p[3], 'base64')), d.final()]).toString('utf8');
}

/* ---------- Supabase (REST) ---------- */
async function sbFetch(path, opt) {
  opt = opt || {};
  const base = env('SUPABASE_URL');
  if (!base) throw new Error('Servidor sem SUPABASE_URL.');
  const key = opt.service ? env('SUPABASE_SERVICE_ROLE_KEY') : env('SUPABASE_ANON_KEY');
  if (!key) throw new Error('Servidor sem as chaves do Supabase configuradas.');
  const headers = { apikey: key, 'Content-Type': 'application/json' };
  // Chaves novas do Supabase (sb_secret_...) nao sao JWT: nesse caso so o cabecalho apikey e enviado.
  if (!opt.service) headers.Authorization = 'Bearer ' + opt.token;
  else if (String(key).startsWith('eyJ')) headers.Authorization = 'Bearer ' + key;
  if (opt.prefer) headers.Prefer = opt.prefer;
  const r = await fetch(base + path, { method: opt.method || 'GET', headers: headers, body: opt.body ? JSON.stringify(opt.body) : undefined });
  const txt = await r.text(); let j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) { j = txt; }
  if (!r.ok) { const m = (j && (j.message || j.error_description || j.hint)) || ('HTTP ' + r.status); const e = new Error('Banco de dados: ' + m); e.status = r.status; throw e; }
  return j;
}
async function podeGerir(token, clienteId) {
  const r = await sbFetch('/rest/v1/rpc/banco_pode_gerir', { method: 'POST', token: token, body: { p_cliente: clienteId } });
  return r === true;
}
async function emailDoToken(token) {
  try { const u = await sbFetch('/auth/v1/user', { token: token }); return u && u.email ? String(u.email) : null; } catch (e) { return null; }
}

/* ---------- chamada HTTPS com certificado de cliente (mTLS) ---------- */
function reqMtls(urlStr, o) {
  return new Promise(function (resolve, reject) {
    const u = new URL(urlStr);
    const opts = { hostname: u.hostname, port: u.port || 443, path: u.pathname + u.search, method: o.method || 'GET', headers: o.headers || {}, cert: o.cert, key: o.key, timeout: 25000 };
    if (env('BANCO_TEST_CA')) opts.ca = env('BANCO_TEST_CA'); // somente em testes locais
    const rq = https.request(opts, function (res) {
      const parts = []; res.on('data', function (d) { parts.push(d); });
      res.on('end', function () {
        const txt = Buffer.concat(parts).toString('utf8'); let j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) { j = null; }
        resolve({ status: res.statusCode, json: j, text: txt });
      });
    });
    rq.on('timeout', function () { rq.destroy(new Error('O banco demorou demais para responder.')); });
    rq.on('error', function (e) { reject(new Error('Falha na conexão segura com o banco: ' + e.message)); });
    if (o.body) rq.write(o.body);
    rq.end();
  });
}

/* ---------- Banco Inter ---------- */
function interBase() { return env('BANCO_INTER_BASE') || 'https://cdpj.partners.bancointer.com.br'; }
async function interToken(cred, escopo) {
  const body = new URLSearchParams({ client_id: cred.client_id, client_secret: cred.client_secret, grant_type: 'client_credentials', scope: escopo || 'extrato.read' }).toString();
  const r = await reqMtls(interBase() + '/oauth/v2/token', { method: 'POST', cert: cred.cert, key: cred.key, body: body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } });
  if (r.status !== 200 || !r.json || !r.json.access_token) {
    const detalhe = r.json && (r.json.error_description || r.json.title || r.json.message || r.json.error) || ('resposta ' + r.status);
    throw new Error('O Inter não autorizou o acesso (' + String(detalhe).slice(0, 160) + '). Confira o Client ID, o Client Secret, o certificado e se a integração está "Ativa" no Inter.');
  }
  return r.json.access_token;
}
async function interGet(cred, token, path, conta) {
  const h = { Authorization: 'Bearer ' + token }; if (conta) h['x-conta-corrente'] = conta;
  const r = await reqMtls(interBase() + path, { method: 'GET', cert: cred.cert, key: cred.key, headers: h });
  if (r.status < 200 || r.status >= 300) { const d = r.json && (r.json.title || r.json.message || r.json.detail) || ('resposta ' + r.status); throw new Error('O Inter recusou a consulta (' + String(d).slice(0, 160) + ').'); }
  return r.json;
}
function hojeISO() { return new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10); }
async function interSaldo(cred, conta) {
  const tk = await interToken(cred, 'extrato.read');
  return interGet(cred, tk, '/banking/v2/saldo?dataSaldo=' + hojeISO(), conta);
}


function diaISO(d) { return new Date(d.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10); }
// Extrato do Inter (somente leitura). Periodo maximo 90 dias. Devolve lancamentos ja no formato do Sacramento.
async function interExtrato(cred, conta, dias) {
  dias = Math.max(1, Math.min(90, parseInt(dias, 10) || 30));
  const fim = new Date(); const ini = new Date(Date.now() - (dias - 1) * 86400000);
  const di = diaISO(ini), df = diaISO(fim);
  const tk = await interToken(cred, 'extrato.read');
  const lista = []; let pagina = 0, total = 1, campos = '';
  while (pagina < total && pagina < 40) {
    const j = await interGet(cred, tk, '/banking/v2/extrato/completo?dataInicio=' + di + '&dataFim=' + df + '&pagina=' + pagina + '&tamanhoPagina=50', conta);
    if (pagina === 0) campos = j && typeof j === 'object' ? Object.keys(j).slice(0, 12).join(', ') : String(typeof j);
    const ts = (j && (j.transacoes || j.lancamentos)) || [];
    ts.forEach(function (t) { lista.push(t); });
    total = (j && Number(j.totalPaginas)) || 1; pagina++;
  }
  const out = []; let zeros = 0;
  lista.forEach(function (t) {
    const bruto = Number(String(t.valor == null ? '' : t.valor).replace(',', '.'));
    if (isFinite(bruto) && bruto === 0) { zeros++; return; }
    if (!isFinite(bruto)) return;
    const op = String(t.tipoOperacao || '').toUpperCase();
    const entrada = op ? op === 'C' : bruto > 0;
    const dt = String(t.dataTransacao || t.dataEntrada || t.dataInclusao || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dt)) return;
    const hist = [t.titulo, t.descricao].filter(Boolean).join(' - ').slice(0, 200) || String(t.tipoTransacao || 'Lançamento Inter');
    const idb = t.idTransacao || t.codigoTransacao;
    const fitid = 'inter:' + (idb ? String(idb) : crypto.createHash('sha1').update([dt, bruto, op, hist].join('|')).digest('hex').slice(0, 24));
    out.push({ fitid: fitid, data: dt, valor: Math.abs(bruto), tipo: entrada ? 'Entrada' : 'Saida', historico: hist });
  });
  return { inicio: di, fim: df, brutas: lista.length, ignoradas: lista.length - out.length - zeros, campos: campos, itens: out };
}

function msgSegura(e) { return String((e && e.message) || e || 'Erro').replace(/[A-Za-z0-9+\/=_-]{40,}/g, '***').slice(0, 300); }

// Busca o extrato de UMA conexao e grava na tabela da Conciliacao (sem duplicar). Lanca erro se falhar.
async function sincronizar(c, dias) {
  const aad = 'cli:' + c.cliente_id + ':' + c.banco + ':' + c.apelido;
  let cred;
  try { cred = { client_id: decifrar(c.client_id_enc, aad), client_secret: decifrar(c.client_secret_enc, aad), cert: decifrar(c.cert_enc, aad), key: decifrar(c.key_enc, aad) }; }
  catch (e) { throw new Error('Não consegui abrir as credenciais guardadas. Cadastre-as de novo.'); }
  const ex = await interExtrato(cred, c.conta_corrente, dias);
  const jaTem = {};
  for (let i = 0; i < ex.itens.length; i += 80) {
    const ids = ex.itens.slice(i, i + 80).map(function (x) { return '"' + x.fitid + '"'; }).join(',');
    const r1 = await sbFetch('/rest/v1/extrato_ofx_importado?cliente_id=eq.' + c.cliente_id + '&conta_id=eq.' + c.conta_id + '&fitid=in.(' + encodeURIComponent(ids) + ')&select=fitid', { service: true });
    (r1 || []).forEach(function (r) { jaTem[r.fitid] = true; });
  }
  const novos = [], vistos = {};
  ex.itens.forEach(function (x) {
    if (jaTem[x.fitid] || vistos[x.fitid]) return; vistos[x.fitid] = true;
    novos.push({ cliente_id: c.cliente_id, conta_id: c.conta_id, fitid: x.fitid, data_transacao: x.data, valor: x.valor, tipo: x.tipo, historico: x.historico, status: 'Pendente' });
  });
  for (let i = 0; i < novos.length; i += 100) await sbFetch('/rest/v1/extrato_ofx_importado', { method: 'POST', service: true, prefer: 'return=minimal', body: novos.slice(i, i + 100) });
  await sbFetch('/rest/v1/banco_conexoes?id=eq.' + c.id, { method: 'PATCH', service: true, body: { status: 'ativa', ultima_sync_em: new Date().toISOString(), ultimo_erro: null } });
  return { ok: true, inicio: ex.inicio, fim: ex.fim, brutas: ex.brutas, ignoradas: ex.ignoradas, campos: ex.campos, lidas: ex.itens.length, novas: novos.length, ja_existiam: ex.itens.length - novos.length };
}
// Igual a sincronizar, mas nunca lanca: registra o erro na conexao e devolve { ok:false, erro }.
async function sincronizarSeguro(c, dias) {
  try { return await sincronizar(c, dias); }
  catch (e) {
    const m = msgSegura(e);
    try { await sbFetch('/rest/v1/banco_conexoes?id=eq.' + c.id, { method: 'PATCH', service: true, body: { status: 'erro', ultimo_erro: m } }); } catch (x) {}
    return { ok: false, erro: m };
  }
}

module.exports = { cifrar, decifrar, sbFetch, podeGerir, emailDoToken, interSaldo, interExtrato, sincronizar, sincronizarSeguro, msgSegura, hojeISO };
