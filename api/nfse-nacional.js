// POST /api/nfse-nacional  { acao: 'emitir' | 'consultar' | 'listar', cliente_id, certificado_id, senha, nota:{...} }
// Emite NFS-e pelo Emissor Publico Nacional (gratuito). A senha do certificado vem a cada pedido, e usada so na memoria e NUNCA guardada.
// Producao so e liberada quando a variavel NFSE_PRODUCAO_LIBERADA = "sim" existir no servidor; fora disso tudo vai para o ambiente de TESTES do governo.
const https = require('https');
const B = require('./_banco');
const N = require('./_nfse_nacional');

function resp(res, code, obj) { res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); }
function lerCorpo(req) {
  return new Promise(function (resolve, reject) {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let s = ''; req.on('data', function (d) { s += d; if (s.length > 100000) { reject(new Error('Corpo grande demais.')); req.destroy(); } });
    req.on('end', function () { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(new Error('Pedido inválido.')); } });
    req.on('error', reject);
  });
}
const limpa = function (s) { return String(s == null ? '' : s).trim(); };
const soDig = function (s) { return String(s == null ? '' : s).replace(/\D/g, ''); };
const msg = function (e) { return String((e && e.message) || e || 'Erro').replace(/[A-Za-z0-9+\/=_-]{40,}/g, '***').slice(0, 300); };

function ambienteAtual() { return process.env.NFSE_PRODUCAO_LIBERADA === 'sim' ? 'producao' : 'homologacao'; }

async function baixarCofre(path) {
  const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error('Servidor sem as chaves do Supabase.');
  const h = { apikey: key }; if (String(key).startsWith('eyJ')) h.Authorization = 'Bearer ' + key;
  const r = await fetch(base + '/storage/v1/object/cofre-certificados/' + path.split('/').map(encodeURIComponent).join('/'), { headers: h });
  if (!r.ok) throw new Error('Não encontrei o arquivo do certificado no cofre.');
  return Buffer.from(await r.arrayBuffer());
}

// CEP -> codigo IBGE do municipio (API publica gratuita ViaCEP)
async function ibgeDoCep(cep) {
  const c = soDig(cep); if (c.length !== 8) return '';
  try { const r = await fetch('https://viacep.com.br/ws/' + c + '/json/'); const j = await r.json(); return j && j.ibge ? String(j.ibge) : ''; } catch (e) { return ''; }
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
    if (!(await B.podeGerir(token, cid))) return resp(res, 403, { ok: false, erro: 'Somente o administrador da empresa pode emitir NFS-e Nacional.' });
    const amb = ambienteAtual();

    if (acao === 'listar') {
      const rows = await B.sbFetch('/rest/v1/nfse_nacional_emitidas?cliente_id=eq.' + cid + '&order=criado_em.desc&limit=100&select=id,ambiente,serie,numero,status,chave_acesso,tomador_nome,tomador_doc,valor,descricao,mensagem,criado_em', { service: true });
      return resp(res, 200, { ok: true, ambiente: amb, notas: rows || [] });
    }
    if (acao === 'xml') {
      const nid = parseInt(b.nota_id, 10);
      const xr = await B.sbFetch('/rest/v1/nfse_nacional_emitidas?id=eq.' + (nid || 0) + '&cliente_id=eq.' + cid + '&select=id,numero,status,ambiente,chave_acesso,xml_nfse,mensagem', { service: true });
      const xn = Array.isArray(xr) ? xr[0] : null;
      if (!xn || !xn.xml_nfse) return resp(res, 404, { ok: false, erro: 'Nota sem XML guardado.' });
      return resp(res, 200, { ok: true, numero: xn.numero, status: xn.status, ambiente: xn.ambiente, chave: xn.chave_acesso, xml: xn.xml_nfse, motivo: xn.mensagem });
    }
    if (acao !== 'emitir' && acao !== 'consultar' && acao !== 'parametros' && acao !== 'cancelar') return resp(res, 400, { ok: false, erro: 'Ação inválida.' });

    // ---- certificado do cofre + senha digitada agora ----
    const certId = parseInt(b.certificado_id, 10); const senha = String(b.senha == null ? '' : b.senha);
    if (!certId) return resp(res, 400, { ok: false, erro: 'Escolha o certificado.' });
    if (!senha) return resp(res, 400, { ok: false, erro: 'Digite a senha do certificado.' });
    const cr = await B.sbFetch('/rest/v1/certificados_digitais?id=eq.' + certId + '&cliente_id=eq.' + cid + '&select=id,tipo,status,validade_fim,pfx_path,cnpj_cpf_titular', { service: true });
    const cert = Array.isArray(cr) ? cr[0] : null;
    if (!cert || !cert.pfx_path) return resp(res, 400, { ok: false, erro: 'Esse certificado não está guardado no cofre.' });
    if (cert.tipo !== 'A1' || cert.status !== 'ativo') return resp(res, 400, { ok: false, erro: 'Use um certificado A1 ativo.' });
    if (cert.validade_fim && new Date(cert.validade_fim + 'T23:59:59') < new Date()) return resp(res, 400, { ok: false, erro: 'Certificado vencido.' });
    const pfx = await baixarCofre(cert.pfx_path);
    let aberto;
    try { aberto = N.abrirPfx(pfx, senha); } catch (e) { return resp(res, 400, { ok: false, erro: 'Não consegui abrir o certificado. Confira a senha.' }); }
    const cred = { pfx: pfx, senha: senha };

    // ---- empresa emitente (dados do cadastro, nunca do navegador) ----
    const er = await B.sbFetch('/rest/v1/clientes_contratantes?id=eq.' + cid + '&select=cnpj,razao_social,inscricao_municipal,cep,email,telefone,regime_tributario', { service: true });
    const emp0 = Array.isArray(er) ? er[0] : null;
    // Parametros Fiscais (configuracoes_fiscais) e a fonte principal do prestador; o cadastro geral so completa o que faltar.
    const fr = await B.sbFetch('/rest/v1/configuracoes_fiscais?cliente_id=eq.' + cid + '&order=id.desc&limit=1&select=cnpj,inscricao_municipal,cep,email,regime_tributario', { service: true });
    const fis = Array.isArray(fr) && fr[0] ? fr[0] : {};
    const emp = emp0 ? Object.assign({}, emp0) : null;
    if (emp) Object.keys(fis).forEach(function (k) { if (String(fis[k] == null ? '' : fis[k]).trim() !== '') emp[k] = fis[k]; });
    if (!emp || soDig(emp.cnpj).length !== 14) return resp(res, 400, { ok: false, erro: 'Cadastro da empresa sem CNPJ. Preencha em Parâmetros Fiscais.' });
    const cn = (aberto.cert.subject.getField('CN') || {}).value || ''; const m = cn.match(/:(\d{14})$/);
    if (!m || m[1] !== soDig(emp.cnpj)) return resp(res, 400, { ok: false, erro: 'O certificado não é do CNPJ desta empresa. Emissão bloqueada por segurança.' });

    if (acao === 'parametros') {
      // Consulta oficial da parametrizacao do municipio (somente leitura). Testa os enderecos provaveis e devolve o status de cada um.
      const cMun = soDig(b.codigo_municipio) || await ibgeDoCep(emp.cep);
      const cServ = soDig(b.codigo_servico);
      const fim = '/parametros_municipais/' + cMun + '/' + (cServ ? cServ : 'convenio');
      const hosts = amb === 'producao' ? ['https://sefin.nfse.gov.br', 'https://adn.nfse.gov.br'] : ['https://sefin.producaorestrita.nfse.gov.br', 'https://adn.producaorestrita.nfse.gov.br'];
      const pref = ['/API/SefinNacional', '/SefinNacional', '', '/contribuintes', '/parametrizacao'];
      const tentativas = []; let achou = null;
      for (const h of hosts) { for (const p of pref) {
        if (achou) break;
        const u = new URL(h + p + fim);
        const rr = await new Promise(function (resolve) {
          const rq = https.request({ method: 'GET', hostname: u.hostname, path: u.pathname, port: 443, key: aberto.keyPem, cert: aberto.certPem, headers: { Accept: 'application/json' }, timeout: 15000 }, function (rs) {
            let t = ''; rs.on('data', function (x) { t += x; if (t.length > 2e6) rq.destroy(); });
            rs.on('end', function () { resolve({ status: rs.statusCode, texto: t.slice(0, 5000) }); });
          });
          rq.on('timeout', function () { rq.destroy(); }); rq.on('error', function (e) { resolve({ status: 0, texto: String(e.message || e).slice(0, 100) }); }); rq.end();
        });
        tentativas.push(h.replace('https://', '') + p + ' -> ' + rr.status);
        if (rr.status === 200) achou = { caminho: h + p + fim, retorno: rr.texto };
        else if (rr.status !== 404 && rr.status !== 0 && !/<html/i.test(rr.texto)) achou = { caminho: h + p + fim, status_http: rr.status, retorno: rr.texto };
      } }
      return resp(res, 200, { ok: !!achou, ambiente: amb, tentativas: tentativas, achou: achou });
    }

    if (acao === 'cancelar') {
      const notaId = parseInt(b.nota_id, 10);
      if (!notaId) return resp(res, 400, { ok: false, erro: 'Nota não informada.' });
      const nr = await B.sbFetch('/rest/v1/nfse_nacional_emitidas?id=eq.' + notaId + '&cliente_id=eq.' + cid + '&select=id,status,ambiente,chave_acesso,numero', { service: true });
      const nota = Array.isArray(nr) ? nr[0] : null;
      if (!nota) return resp(res, 404, { ok: false, erro: 'Nota não encontrada nesta empresa.' });
      if (nota.status !== 'autorizada' || !nota.chave_acesso) return resp(res, 400, { ok: false, erro: 'Só dá para cancelar nota autorizada.' });
      if (nota.ambiente !== amb) return resp(res, 400, { ok: false, erro: 'Essa nota é de outro ambiente (' + nota.ambiente + ').' });
      let rc;
      try { rc = await N.cancelar(amb, { cnpjAutor: soDig(emp.cnpj), chave: nota.chave_acesso, codMotivo: limpa(b.cod_motivo) || '9', motivo: limpa(b.motivo), data: new Date() }, cred); }
      catch (e) { return resp(res, 400, { ok: false, erro: msg(e) }); }
      if (rc.ok) {
        try { await B.sbFetch('/rest/v1/nfse_nacional_emitidas?id=eq.' + notaId, { method: 'PATCH', service: true, prefer: 'return=minimal', body: { status: 'cancelada', mensagem: ('Cancelada: ' + limpa(b.motivo)).slice(0, 1000), retorno: String(rc.bruto || '').slice(0, 4000) } }); } catch (e) {}
        return resp(res, 200, { ok: true, ambiente: amb, numero: nota.numero });
      }
      return resp(res, 422, { ok: false, erro: 'O Emissor Nacional não aceitou o cancelamento: ' + String(rc.mensagem || ('código ' + rc.status)).slice(0, 300) });
    }

    if (acao === 'consultar') {
      const chave = soDig(b.chave_acesso);
      if (chave.length < 40) return resp(res, 400, { ok: false, erro: 'Chave de acesso inválida.' });
      const r = await N.consultar(amb, chave, cred);
      return resp(res, 200, { ok: r.ok, ambiente: amb, chave_acesso: r.chaveAcesso, status_http: r.status, mensagem: r.mensagem });
    }

    // ---- emitir ----
    const n = b.nota || {}; const T = n.tomador || {}; const S = n.servico || {};
    const optante = /simples/i.test(String(emp.regime_tributario || ''));
    const codMun = await ibgeDoCep(emp.cep);
    if (!codMun) return resp(res, 400, { ok: false, erro: 'Não consegui descobrir o município da empresa pelo CEP cadastrado.' });
    const codMunTom = soDig(T.codigo_municipio) || await ibgeDoCep(T.cep);
    const serie = '1';
    // reserva o numero da DPS (indice unico impede duplicidade)
    const ult = await B.sbFetch('/rest/v1/nfse_nacional_emitidas?cliente_id=eq.' + cid + '&ambiente=eq.' + amb + '&serie=eq.' + serie + '&order=numero.desc&limit=1&select=numero', { service: true });
    const numero = (Array.isArray(ult) && ult[0] ? Number(ult[0].numero) : 0) + 1;
    const d = {
      ambiente: amb, serie: serie, numero: numero, dataEmissao: new Date(), optanteSimples: optante, aliquotaSimples: Number(n.aliquota_simples),
      prestador: { cnpj: emp.cnpj, inscricaoMunicipal: emp.inscricao_municipal, telefone: emp.telefone, email: emp.email, codigoMunicipio: codMun },
      tomador: { cpf: soDig(T.documento).length === 11 ? T.documento : '', cnpj: soDig(T.documento).length === 14 ? T.documento : '', nome: limpa(T.nome), codigoMunicipio: codMunTom, cep: T.cep, logradouro: limpa(T.logradouro), numero: limpa(T.numero), complemento: limpa(T.complemento), bairro: limpa(T.bairro), telefone: T.telefone, email: limpa(T.email) },
      servico: { codigoTribNac: S.codigo_trib_nac, codigoTribMun: limpa(S.codigo_trib_mun), descricao: limpa(S.descricao), valor: Number(S.valor), issRetido: !!S.iss_retido, cnbs: String(S.cnbs || '').replace(/\D/g, '') }
    };
    const erros = N.validar(d); if (erros.length) return resp(res, 400, { ok: false, erro: erros.join(' ') });
    const email = await B.emailDoToken(token);
    const reg = { cliente_id: cid, ambiente: amb, serie: serie, numero: numero, status: 'processando', tomador_doc: soDig(T.documento), tomador_nome: d.tomador.nome, valor: d.servico.valor, descricao: d.servico.descricao, criado_por: email };
    let linha;
    try { linha = await B.sbFetch('/rest/v1/nfse_nacional_emitidas', { method: 'POST', service: true, prefer: 'return=representation', body: reg }); }
    catch (e) { return resp(res, 409, { ok: false, erro: 'Outra emissão estava em andamento. Tente novamente.' }); }
    const id = linha && linha[0] ? linha[0].id : null;
    let r;
    try { r = await N.emitir(d, cred); } catch (e) { r = { ok: false, mensagem: msg(e) }; }
    const upd = r.ok ? { status: 'autorizada', chave_acesso: r.chaveAcesso, xml_nfse: r.nfseXml, id_dps: r.idDps, mensagem: null }
      : { status: 'recusada', id_dps: r.idDps || null, mensagem: String(r.mensagem || 'Recusada.').slice(0, 1000), retorno: r.erros ? JSON.stringify(r.erros).slice(0, 4000) : null };
    if (id) { try { await B.sbFetch('/rest/v1/nfse_nacional_emitidas?id=eq.' + id, { method: 'PATCH', service: true, prefer: 'return=minimal', body: upd }); } catch (e) {} }
    return resp(res, r.ok ? 200 : 422, { ok: r.ok, ambiente: amb, numero: numero, chave_acesso: r.chaveAcesso || null, erro: r.ok ? null : upd.mensagem });
  } catch (e) {
    return resp(res, 500, { ok: false, erro: msg(e) });
  }
};
