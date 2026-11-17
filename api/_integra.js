// Biblioteca interna do Integra Contador (Serpro). Nao e uma rota: arquivos com _ no inicio nao viram endereco.
// Somente LEITURA por enquanto: autenticacao + consultas liberadas no CATALOGO. Nada e enviado/transmitido a Receita.
const https = require('https');
const { URL } = require('url');

function env(n) { return process.env[n]; }
function authUrl() { return env('INTEGRA_AUTH_URL') || 'https://autenticacao.sapi.serpro.gov.br/authenticate'; }
function gatewayUrl() { return env('INTEGRA_GATEWAY_URL') || 'https://gateway.apiserpro.serpro.gov.br/integra-contador/v1/'; }

// Servicos liberados no Sacramento. Cada servico novo entra aqui depois de conferido na documentacao oficial do Serpro.
// Formato: 'SISTEMA/SERVICO': { metodo: 'Consultar'|'Monitorar'|..., versao: '1.0', gratuito: true|false, custo: valor estimado em R$ }
const CATALOGO = {};

/* ---------- HTTPS com certificado de cliente .pfx (mTLS) ---------- */
function reqPfx(urlStr, o) {
  return new Promise(function (resolve, reject) {
    const u = new URL(urlStr);
    const opts = { hostname: u.hostname, port: u.port || 443, path: u.pathname + u.search, method: o.method || 'GET', headers: o.headers || {}, timeout: 25000 };
    if (o.pfx) { opts.pfx = o.pfx; opts.passphrase = o.passphrase; }
    if (env('INTEGRA_TEST_CA')) opts.ca = env('INTEGRA_TEST_CA'); // somente em testes locais
    const rq = https.request(opts, function (res) {
      let cert = null;
      try { const c = res.socket && res.socket.getCertificate ? res.socket.getCertificate() : null; if (c && c.valid_to) cert = { valid_to: c.valid_to, subject: c.subject || null }; } catch (e) {}
      const parts = []; res.on('data', function (d) { parts.push(d); });
      res.on('end', function () {
        const txt = Buffer.concat(parts).toString('utf8'); let j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) { j = null; }
        resolve({ status: res.statusCode, json: j, text: txt, cert: cert });
      });
    });
    rq.on('timeout', function () { rq.destroy(new Error('O Serpro demorou demais para responder.')); });
    rq.on('error', function (e) { reject(new Error('Falha na conexão segura com o Serpro: ' + e.message)); });
    if (o.body) rq.write(o.body);
    rq.end();
  });
}

function dataDoCert(validTo) {
  const d = new Date(validTo); if (isNaN(d)) return null; return d.toISOString().slice(0, 10);
}

// 1o passo do Serpro: troca Consumer Key/Secret + certificado e-CNPJ por access_token e jwt_token temporarios.
async function autenticar(cred) {
  const basic = Buffer.from(cred.consumer_key + ':' + cred.consumer_secret, 'utf8').toString('base64');
  const body = 'grant_type=client_credentials';
  const r = await reqPfx(authUrl(), { method: 'POST', pfx: cred.pfx, passphrase: cred.pfx_senha, body: body,
    headers: { Authorization: 'Basic ' + basic, 'Role-Type': 'TERCEIROS', 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } });
  if (r.status !== 200 || !r.json || !r.json.access_token || !r.json.jwt_token) {
    let d = r.json && (r.json.error_description || r.json.message || r.json.error || r.json.mensagem) || ('resposta ' + r.status);
    if (r.status === 401 || r.status === 403) d += ' (confira Consumer Key, Consumer Secret e se o certificado é o MESMO e-CNPJ usado na contratação)';
    throw new Error('O Serpro não autorizou o acesso: ' + String(d).slice(0, 200));
  }
  return { access_token: r.json.access_token, jwt_token: r.json.jwt_token, expires_in: Number(r.json.expires_in) || 1800, cert: r.cert };
}

const cache = {}; // tokens temporarios em memoria do servidor (nunca em banco, nunca no navegador)
async function tokenDe(chave, cred, forcar) {
  const c = cache[chave];
  if (!forcar && c && c.ate > Date.now() + 60000) return c.tk;
  const tk = await autenticar(cred);
  cache[chave] = { tk: tk, ate: Date.now() + tk.expires_in * 1000 };
  return tk;
}
function esquecerToken(chave) { delete cache[chave]; }

// Chamada de servico (Consultar / Monitorar / ...). pedido = { contratante, autor, contribuinte, idSistema, idServico, versao, dados }
async function chamar(tk, metodo, pedido) {
  const corpo = JSON.stringify({
    contratante: { numero: pedido.contratante, tipo: 2 },
    autorPedidoDados: { numero: pedido.autor || pedido.contratante, tipo: 2 },
    contribuinte: { numero: pedido.contribuinte, tipo: 2 },
    pedidoDados: { idSistema: pedido.idSistema, idServico: pedido.idServico, versaoSistema: pedido.versao || '1.0', dados: typeof pedido.dados === 'string' ? pedido.dados : JSON.stringify(pedido.dados || {}) }
  });
  return reqPfx(gatewayUrl() + metodo, { method: 'POST', body: corpo,
    headers: { Authorization: 'Bearer ' + tk.access_token, jwt_token: tk.jwt_token, 'Content-Type': 'application/json', Accept: 'application/json', 'Content-Length': Buffer.byteLength(corpo) } });
}

module.exports = { CATALOGO, autenticar, tokenDe, esquecerToken, chamar, dataDoCert };
