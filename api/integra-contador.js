// POST /api/integra-contador  { acao: 'salvar' | 'testar' | 'remover' | 'consultar', cliente_id, ... }
// Segredos NUNCA voltam para o navegador. Quem chama precisa estar logado e ser administrador da empresa-escritorio (ou master).
const tls = require('tls');
const B = require('./_banco');
const I = require('./_integra');

function resp(res, code, obj) { res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); }
function lerCorpo(req) {
  return new Promise(function (resolve, reject) {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let s = ''; req.on('data', function (d) { s += d; if (s.length > 300000) { reject(new Error('Corpo grande demais.')); req.destroy(); } });
    req.on('end', function () { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(new Error('Pedido inválido.')); } });
    req.on('error', reject);
  });
}
function limpa(s) { return String(s == null ? '' : s).trim(); }
function soDig(s) { return String(s == null ? '' : s).replace(/\D/g, ''); }
function msgSegura(e) { return String((e && e.message) || e || 'Erro').replace(/[A-Za-z0-9+\/=_-]{40,}/g, '***').slice(0, 300); }
const aadDe = function (cid) { return 'integra:' + cid; };

async function carregarConfig(cid) {
  const rows = await B.sbFetch('/rest/v1/integra_contador_config?cliente_id=eq.' + cid + '&select=*', { service: true });
  return Array.isArray(rows) ? rows[0] : null;
}
function abrirCred(c) {
  const aad = aadDe(c.cliente_id);
  return { consumer_key: B.decifrar(c.consumer_key_enc, aad), consumer_secret: B.decifrar(c.consumer_secret_enc, aad),
    pfx: Buffer.from(B.decifrar(c.pfx_enc, aad), 'base64'), pfx_senha: B.decifrar(c.pfx_senha_enc, aad) };
}
async function registrarUso(cid, o) {
  try {
    await B.sbFetch('/rest/v1/integra_contador_uso', { method: 'POST', service: true, prefer: 'return=minimal', body: {
      cliente_id: cid, contribuinte_cnpj: o.contribuinte || null, id_sistema: o.sistema, id_servico: o.servico, gratuito: !!o.gratuito,
      custo_estimado: o.custo || 0, ok: !!o.ok, http_status: o.status || null, mensagem: o.mensagem ? String(o.mensagem).slice(0, 300) : null, criado_por: o.por || null } });
  } catch (e) { /* o registro de consumo nunca derruba a operacao */ }
}

module.exports = async function (req, res) {
  try {
    if (req.method !== 'POST') return resp(res, 405, { ok: false, erro: 'Use POST.' });
    const auth = String(req.headers.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return resp(res, 401, { ok: false, erro: 'Faça login novamente.' });
    const b = await lerCorpo(req);
    const acao = limpa(b.acao);
    const cid = parseInt(b.cliente_id, 10);
    if (!cid) return resp(res, 400, { ok: false, erro: 'Empresa não informada.' });
    if (!(await B.podeGerir(token, cid))) return resp(res, 403, { ok: false, erro: 'Somente o administrador da empresa pode gerir a integração com a Receita.' });
    const email = await B.emailDoToken(token);

    /* ---------- salvar / atualizar credenciais ---------- */
    if (acao === 'salvar') {
      const cnpj = soDig(b.cnpj);
      const key = limpa(b.consumer_key), secret = limpa(b.consumer_secret), pfxB64 = limpa(b.pfx_base64).replace(/\s/g, ''), senha = String(b.pfx_senha == null ? '' : b.pfx_senha);
      if (cnpj.length !== 14) return resp(res, 400, { ok: false, erro: 'Informe o CNPJ do escritório (14 números), o mesmo do certificado e-CNPJ.' });
      if (key.length < 8 || secret.length < 8) return resp(res, 400, { ok: false, erro: 'Consumer Key ou Consumer Secret inválido.' });
      if (!pfxB64 || !/^[A-Za-z0-9+\/=]+$/.test(pfxB64)) return resp(res, 400, { ok: false, erro: 'Escolha o arquivo do certificado (.pfx ou .p12).' });
      if (!senha) return resp(res, 400, { ok: false, erro: 'Informe a senha do certificado.' });
      const pfx = Buffer.from(pfxB64, 'base64');
      if (pfx.length < 500 || pfx.length > 60000) return resp(res, 400, { ok: false, erro: 'O arquivo não parece ser um certificado e-CNPJ A1 (.pfx/.p12).' });
      try { tls.createSecureContext({ pfx: pfx, passphrase: senha }); }
      catch (e) { return resp(res, 400, { ok: false, erro: 'Não consegui abrir o certificado: a senha está errada ou o arquivo não é um certificado A1 válido.' }); }
      const aad = aadDe(cid);
      const reg = { cliente_id: cid, cnpj_contratante: cnpj, consumer_key_enc: B.cifrar(key, aad), consumer_secret_enc: B.cifrar(secret, aad),
        pfx_enc: B.cifrar(pfx.toString('base64'), aad), pfx_senha_enc: B.cifrar(senha, aad), validade: null, status: 'nova', ultimo_erro: null, criado_por: email };
      await B.sbFetch('/rest/v1/integra_contador_config?on_conflict=cliente_id', { method: 'POST', service: true, prefer: 'resolution=merge-duplicates,return=minimal', body: reg });
      I.esquecerToken('c' + cid);
      return resp(res, 200, { ok: true });
    }

    const c = await carregarConfig(cid);
    if (!c) return resp(res, 404, { ok: false, erro: 'Ainda não há credenciais cadastradas para esta empresa.' });

    if (acao === 'remover') {
      await B.sbFetch('/rest/v1/integra_contador_config?cliente_id=eq.' + cid, { method: 'DELETE', service: true });
      I.esquecerToken('c' + cid);
      return resp(res, 200, { ok: true });
    }

    let cred;
    try { cred = abrirCred(c); } catch (e) { return resp(res, 500, { ok: false, erro: 'Não consegui abrir as credenciais guardadas. Cadastre-as de novo.' }); }

    /* ---------- testar a conexao (so autentica; nao consulta nenhum cliente) ---------- */
    if (acao === 'testar') {
      try {
        I.esquecerToken('c' + cid);
        const tk = await I.tokenDe('c' + cid, cred, true);
        const validade = tk.cert && tk.cert.valid_to ? I.dataDoCert(tk.cert.valid_to) : null;
        await B.sbFetch('/rest/v1/integra_contador_config?cliente_id=eq.' + cid, { method: 'PATCH', service: true, body: { status: 'ativa', ultimo_teste_em: new Date().toISOString(), ultimo_erro: null, validade: validade } });
        await registrarUso(cid, { sistema: 'AUTENTICACAO', servico: 'TESTE', gratuito: true, custo: 0, ok: true, status: 200, mensagem: 'Teste de conexão (somente autenticação)', por: email });
        return resp(res, 200, { ok: true, validade: validade });
      } catch (e) {
        const m = msgSegura(e);
        try { await B.sbFetch('/rest/v1/integra_contador_config?cliente_id=eq.' + cid, { method: 'PATCH', service: true, body: { status: 'erro', ultimo_teste_em: new Date().toISOString(), ultimo_erro: m } }); } catch (x) {}
        await registrarUso(cid, { sistema: 'AUTENTICACAO', servico: 'TESTE', gratuito: true, custo: 0, ok: false, mensagem: m, por: email });
        return resp(res, 200, { ok: false, erro: m });
      }
    }

    /* ---------- consultar (somente servicos liberados no CATALOGO) ---------- */
    if (acao === 'consultar') {
      const sistema = limpa(b.id_sistema).toUpperCase(), servico = limpa(b.id_servico).toUpperCase();
      const def = I.CATALOGO[sistema + '/' + servico];
      if (!def) return resp(res, 400, { ok: false, erro: 'Este serviço ainda não foi liberado no Sacramento.' });
      const contribuinte = soDig(b.contribuinte);
      if (contribuinte.length !== 14) return resp(res, 400, { ok: false, erro: 'CNPJ do cliente inválido.' });
      if (!def.gratuito && b.confirmar_custo !== true) return resp(res, 200, { ok: false, precisa_confirmar: true, custo_estimado: def.custo || 0, erro: 'Esta consulta é paga (estimativa R$ ' + (def.custo || 0).toFixed(2) + '). Confirme para continuar.' });
      const chave = 'c' + cid;
      try {
        let tk = await I.tokenDe(chave, cred, false);
        let r = await I.chamar(tk, def.metodo, { contratante: c.cnpj_contratante, contribuinte: contribuinte, idSistema: sistema, idServico: servico, versao: def.versao, dados: b.dados || {} });
        if (r.status === 401) { tk = await I.tokenDe(chave, cred, true); r = await I.chamar(tk, def.metodo, { contratante: c.cnpj_contratante, contribuinte: contribuinte, idSistema: sistema, idServico: servico, versao: def.versao, dados: b.dados || {} }); }
        const ok = r.status >= 200 && r.status < 300;
        const msg = r.json && Array.isArray(r.json.mensagens) && r.json.mensagens[0] ? (r.json.mensagens[0].codigo + ' ' + r.json.mensagens[0].texto) : null;
        await registrarUso(cid, { contribuinte: contribuinte, sistema: sistema, servico: servico, gratuito: def.gratuito, custo: ok ? (def.gratuito ? 0 : def.custo || 0) : 0, ok: ok, status: r.status, mensagem: msg, por: email });
        return resp(res, 200, { ok: ok, status: r.status, resultado: r.json, erro: ok ? null : (msg || 'O Serpro respondeu ' + r.status) });
      } catch (e) {
        const m = msgSegura(e);
        await registrarUso(cid, { contribuinte: contribuinte, sistema: sistema, servico: servico, gratuito: def.gratuito, custo: 0, ok: false, mensagem: m, por: email });
        return resp(res, 200, { ok: false, erro: m });
      }
    }
    return resp(res, 400, { ok: false, erro: 'Ação desconhecida.' });
  } catch (e) {
    return resp(res, 500, { ok: false, erro: msgSegura(e) });
  }
};
