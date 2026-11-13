// POST /api/banco-conexao  { acao: 'salvar' | 'testar' | 'remover', ... }
// Segredos NUNCA voltam para o navegador. Quem chama precisa estar logado e ser administrador da empresa (ou master).
const crypto = require('crypto');
const B = require('./_banco');

function resp(res, code, obj) { res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); }
function lerCorpo(req) {
  return new Promise(function (resolve, reject) {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let s = ''; req.on('data', function (d) { s += d; if (s.length > 200000) { reject(new Error('Corpo grande demais.')); req.destroy(); } });
    req.on('end', function () { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(new Error('Pedido inválido.')); } });
    req.on('error', reject);
  });
}
function limpa(s) { return String(s == null ? '' : s).trim(); }
function msgSegura(e) { return String((e && e.message) || e || 'Erro').replace(/[A-Za-z0-9+\/=_-]{40,}/g, '***').slice(0, 300); }

module.exports = async function (req, res) {
  try {
    if (req.method !== 'POST') return resp(res, 405, { ok: false, erro: 'Use POST.' });
    const auth = String(req.headers.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return resp(res, 401, { ok: false, erro: 'Faça login novamente.' });
    const b = await lerCorpo(req);
    const acao = limpa(b.acao);

    /* ---------- salvar / atualizar credenciais ---------- */
    if (acao === 'salvar') {
      const cid = parseInt(b.cliente_id, 10);
      if (!cid) return resp(res, 400, { ok: false, erro: 'Empresa não informada.' });
      if (!(await B.podeGerir(token, cid))) return resp(res, 403, { ok: false, erro: 'Somente o administrador da empresa pode cadastrar conexões bancárias.' });
      const banco = limpa(b.banco) || 'inter';
      if (banco !== 'inter') return resp(res, 400, { ok: false, erro: 'Banco ainda não suportado.' });
      const apelido = limpa(b.apelido).slice(0, 60) || 'Conta principal';
      const clientId = limpa(b.client_id), clientSecret = limpa(b.client_secret), certPem = limpa(b.cert_pem), keyPem = limpa(b.key_pem);
      const conta = limpa(b.conta_corrente).replace(/[^0-9-]/g, '').slice(0, 20) || null;
      if (clientId.length < 8 || clientSecret.length < 8) return resp(res, 400, { ok: false, erro: 'Client ID ou Client Secret inválido.' });
      if (!/-----BEGIN CERTIFICATE-----/.test(certPem)) return resp(res, 400, { ok: false, erro: 'O arquivo do certificado (.crt) não parece válido. Use o arquivo que termina em .crt.' });
      if (!/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(keyPem)) return resp(res, 400, { ok: false, erro: 'O arquivo da chave (.key) não parece válido. Use o arquivo que termina em .key.' });
      let validade = null;
      try {
        const x = new crypto.X509Certificate(certPem);
        const pk = crypto.createPrivateKey(keyPem);
        if (!x.checkPrivateKey(pk)) return resp(res, 400, { ok: false, erro: 'A chave (.key) não corresponde a este certificado (.crt). Confira se são do mesmo download.' });
        const vt = new Date(x.validTo); if (!isNaN(vt)) validade = vt.toISOString().slice(0, 10);
        if (!isNaN(vt) && vt < new Date()) return resp(res, 400, { ok: false, erro: 'Este certificado já está vencido. Gere um novo no Inter.' });
      } catch (e) { return resp(res, 400, { ok: false, erro: 'Não consegui ler o certificado/chave: ' + msgSegura(e) }); }

      const aad = 'cli:' + cid + ':' + banco + ':' + apelido;
      const reg = { cliente_id: cid, banco: banco, apelido: apelido, conta_corrente: conta,
        client_id_enc: B.cifrar(clientId, aad), client_secret_enc: B.cifrar(clientSecret, aad), cert_enc: B.cifrar(certPem, aad), key_enc: B.cifrar(keyPem, aad),
        validade: validade, status: 'nova', ultimo_erro: null, criado_por: await B.emailDoToken(token) };
      const r = await B.sbFetch('/rest/v1/banco_conexoes?on_conflict=cliente_id,banco,apelido', { method: 'POST', service: true, prefer: 'resolution=merge-duplicates,return=representation', body: reg });
      const id = Array.isArray(r) && r[0] ? r[0].id : null;
      return resp(res, 200, { ok: true, id: id, validade: validade });
    }

    /* ---------- testar / remover (precisam da conexão) ---------- */
    const id = parseInt(b.id, 10);
    if (!id) return resp(res, 400, { ok: false, erro: 'Conexão não informada.' });
    const rows = await B.sbFetch('/rest/v1/banco_conexoes?id=eq.' + id + '&select=*', { service: true });
    const c = Array.isArray(rows) ? rows[0] : null;
    if (!c) return resp(res, 404, { ok: false, erro: 'Conexão não encontrada.' });
    if (!(await B.podeGerir(token, c.cliente_id))) return resp(res, 403, { ok: false, erro: 'Sem permissão para esta empresa.' });

    if (acao === 'remover') {
      await B.sbFetch('/rest/v1/banco_conexoes?id=eq.' + id, { method: 'DELETE', service: true });
      return resp(res, 200, { ok: true });
    }

    if (acao === 'testar') {
      const aad = 'cli:' + c.cliente_id + ':' + c.banco + ':' + c.apelido;
      let cred;
      try { cred = { client_id: B.decifrar(c.client_id_enc, aad), client_secret: B.decifrar(c.client_secret_enc, aad), cert: B.decifrar(c.cert_enc, aad), key: B.decifrar(c.key_enc, aad) }; }
      catch (e) { return resp(res, 500, { ok: false, erro: 'Não consegui abrir as credenciais guardadas. Cadastre-as de novo.' }); }
      try {
        const s = await B.interSaldo(cred, c.conta_corrente);
        await B.sbFetch('/rest/v1/banco_conexoes?id=eq.' + id, { method: 'PATCH', service: true, body: { status: 'ativa', ultimo_teste_em: new Date().toISOString(), ultimo_erro: null } });
        return resp(res, 200, { ok: true, saldo_disponivel: s && s.disponivel != null ? Number(s.disponivel) : null, data: B.hojeISO(), validade: c.validade });
      } catch (e) {
        const m = msgSegura(e);
        try { await B.sbFetch('/rest/v1/banco_conexoes?id=eq.' + id, { method: 'PATCH', service: true, body: { status: 'erro', ultimo_teste_em: new Date().toISOString(), ultimo_erro: m } }); } catch (x) {}
        return resp(res, 200, { ok: false, erro: m });
      }
    }
    return resp(res, 400, { ok: false, erro: 'Ação desconhecida.' });
  } catch (e) {
    return resp(res, 500, { ok: false, erro: msgSegura(e) });
  }
};
