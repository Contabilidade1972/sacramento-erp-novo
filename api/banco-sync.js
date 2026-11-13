// Busca automatica diaria do extrato de TODAS as conexoes bancarias ligadas a uma conta.
// Chamada pelo agendador do Vercel (cron) com o cabecalho Authorization: Bearer <CRON_SECRET>.
// Nao devolve segredo nenhum: so contagens.
const crypto = require('crypto');
const B = require('./_banco');

function resp(res, code, obj) { res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); }
function igual(a, b) { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); }

module.exports = async function (req, res) {
  try {
    const segredo = process.env.CRON_SECRET || '';
    if (segredo.length < 16) return resp(res, 503, { ok: false, erro: 'CRON_SECRET não configurado no servidor.' });
    const auth = String(req.headers.authorization || '');
    if (!igual(auth, 'Bearer ' + segredo)) return resp(res, 401, { ok: false, erro: 'Não autorizado.' });
    const lista = await B.sbFetch('/rest/v1/banco_conexoes?conta_id=not.is.null&status=neq.inativa&select=*&order=id', { service: true });
    const out = [];
    for (const c of (lista || [])) {
      const r = await B.sincronizarSeguro(c, 5);
      out.push({ conexao: c.id, empresa: c.cliente_id, ok: r.ok, novas: r.novas || 0, ignoradas: r.ignoradas || 0, erro: r.erro || null });
    }
    return resp(res, 200, { ok: true, conexoes: out.length, novas: out.reduce(function (t, x) { return t + x.novas; }, 0), detalhe: out });
  } catch (e) {
    return resp(res, 500, { ok: false, erro: B.msgSegura(e) });
  }
};
