// NFS-e Nacional (Emissor Publico Nacional / Sefin Nacional) - montagem da DPS, assinatura e envio.
// Codigo proprio do Sacramento ERP. Leiaute e enderecos conforme a documentacao oficial (gov.br/nfse).
// IMPORTANTE: validar sempre no ambiente de producao restrita antes de qualquer emissao real.
const zlib = require('zlib');
const https = require('https');
const forge = require('node-forge');
const { SignedXml } = require('xml-crypto');

const NS = 'http://www.sped.fazenda.gov.br/nfse';
const URLS = {
  homologacao: 'https://sefin.producaorestrita.nfse.gov.br/SefinNacional',
  producao: 'https://sefin.nfse.gov.br/SefinNacional'
};

function so(s) { return String(s == null ? '' : s).replace(/\D/g, ''); }
function zpad(s, n) { return so(s).padStart(n, '0').slice(-n); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]; }); }
function dec2(v) { var n = Number(v); if (!isFinite(n)) throw new Error('Valor numerico invalido.'); return n.toFixed(2); }
function tag(nome, valor) { return valor === undefined || valor === null || valor === '' ? '' : '<' + nome + '>' + esc(valor) + '</' + nome + '>'; }

// Id da DPS: "DPS" + cLocEmi(7) + tpInsc(1) + CNPJ(14) + serie(5) + nDPS(15)
function idDps(d) {
  return 'DPS' + zpad(d.prestador.codigoMunicipio, 7) + '2' + zpad(d.prestador.cnpj, 14) + zpad(d.serie, 5) + zpad(d.numero, 15);
}

// d = { ambiente, serie, numero, dataEmissao(Date), optanteSimples(bool), aliquotaSimples,
//       prestador{cnpj, inscricaoMunicipal, telefone, email, codigoMunicipio},
//       tomador{cpf|cnpj, nome, codigoMunicipio, cep, logradouro, numero, complemento, bairro, telefone, email},
//       servico{codigoTribNac, codigoTribMun, descricao, valor, issRetido} }
function validar(d) {
  var erros = [];
  if (!d || !d.prestador || !d.tomador || !d.servico) return ['Dados incompletos.'];
  if (so(d.prestador.cnpj).length !== 14) erros.push('CNPJ do prestador invalido.');
  if (so(d.prestador.codigoMunicipio).length !== 7) erros.push('Codigo IBGE do municipio do prestador deve ter 7 digitos.');
  if (!(so(d.tomador.cpf).length === 11 || so(d.tomador.cnpj).length === 14)) erros.push('CPF/CNPJ do tomador invalido.');
  if (!String(d.tomador.nome || '').trim()) erros.push('Nome do tomador obrigatorio.');
  if (so(d.servico.codigoTribNac).length < 4) erros.push('Codigo de tributacao nacional do servico obrigatorio.');
  if (!String(d.servico.descricao || '').trim()) erros.push('Descricao do servico obrigatoria.');
  if (!(Number(d.servico.valor) > 0)) erros.push('Valor do servico deve ser maior que zero.');
  if (!(Number(d.numero) > 0)) erros.push('Numero da DPS obrigatorio.');
  if (d.optanteSimples && !(Number(d.aliquotaSimples) > 0)) erros.push('Informe a aliquota total do Simples (percentual).');
  return erros;
}

function montarDpsXml(d) {
  var er = validar(d); if (er.length) throw new Error(er.join(' '));
  var dt = d.dataEmissao instanceof Date ? d.dataEmissao : new Date(d.dataEmissao);
  // horario de Brasilia (UTC-3)
  var br = new Date(dt.getTime() - 3 * 3600 * 1000);
  var iso = br.toISOString().slice(0, 19);
  var id = idDps(d);
  var P = d.prestador, T = d.tomador, S = d.servico;
  var tpAmb = d.ambiente === 'producao' ? '1' : '2';
  var x = '<DPS xmlns="' + NS + '" versao="1.01"><infDPS Id="' + id + '">';
  x += tag('tpAmb', tpAmb) + tag('dhEmi', iso + '-03:00') + tag('verAplic', 'sacramento-1.0') + tag('serie', String(Number(d.serie))) + tag('nDPS', String(Number(d.numero)));
  x += tag('dCompet', iso.slice(0, 10)) + tag('tpEmit', '1') + tag('cLocEmi', zpad(P.codigoMunicipio, 7));
  x += '<prest>' + tag('CNPJ', zpad(P.cnpj, 14)) + tag('IM', so(P.inscricaoMunicipal)) + tag('fone', so(P.telefone)) + tag('email', P.email);
  x += '<regTrib>' + tag('opSimpNac', d.optanteSimples ? '3' : '1') + (d.optanteSimples ? tag('regApTribSN', '1') : '') + tag('regEspTrib', '0') + '</regTrib></prest>';
  x += '<toma>' + (so(T.cpf).length === 11 ? tag('CPF', so(T.cpf)) : tag('CNPJ', zpad(T.cnpj, 14))) + tag('xNome', T.nome);
  if (T.logradouro) {
    x += '<end><endNac>' + tag('cMun', zpad(T.codigoMunicipio, 7)) + tag('CEP', zpad(T.cep, 8)) + '</endNac>' + tag('xLgr', T.logradouro) + tag('nro', T.numero || 'S/N') + tag('xCpl', T.complemento) + tag('xBairro', T.bairro) + '</end>';
  }
  x += tag('fone', so(T.telefone)) + tag('email', T.email) + '</toma>';
  x += '<serv><locPrest>' + tag('cLocPrestacao', zpad(P.codigoMunicipio, 7)) + '</locPrest>';
  x += '<cServ>' + tag('cTribNac', zpad(S.codigoTribNac, 6)) + tag('cTribMun', S.codigoTribMun) + tag('xDescServ', S.descricao) + '</cServ></serv>';
  x += '<valores><vServPrest>' + tag('vServ', dec2(S.valor)) + '</vServPrest>';
  x += '<trib><tribMun>' + tag('tribISSQN', '1') + tag('tpRetISSQN', S.issRetido ? '2' : '1') + '</tribMun>';
  x += '<totTrib>' + (d.optanteSimples ? tag('pTotTribSN', dec2(d.aliquotaSimples)) : '<pTotTrib>' + tag('pTotTribFed', '0.00') + tag('pTotTribEst', '0.00') + tag('pTotTribMun', '0.00') + '</pTotTrib>') + '</totTrib></trib></valores>';
  x += '</infDPS></DPS>';
  return { xml: x, id: id };
}

// Extrai chave privada e certificado de um .pfx (Buffer). Nunca registre a senha em log.
function abrirPfx(pfxBuf, senha) {
  var der = forge.util.createBuffer(pfxBuf.toString('binary'));
  var p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(der), false, String(senha));
  var keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] || [];
  var keyBags2 = p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag] || [];
  var certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || [];
  var kb = (keyBags[0] || keyBags2[0]);
  if (!kb || !certBags.length) throw new Error('Certificado sem chave privada ou sem certificado.');
  // escolhe o certificado cuja chave publica casa com a chave privada
  var pub = forge.pki.setRsaPublicKey(kb.key.n, kb.key.e);
  var pubPem = forge.pki.publicKeyToPem(pub);
  var cert = certBags.map(function (b) { return b.cert; }).find(function (c) { return forge.pki.publicKeyToPem(c.publicKey) === pubPem; }) || certBags[0].cert;
  return { keyPem: forge.pki.privateKeyToPem(kb.key), certPem: forge.pki.certificateToPem(cert), cert: cert };
}

function certBase64(certPem) { return certPem.replace(/-----(BEGIN|END) CERTIFICATE-----/g, '').replace(/\s+/g, ''); }

// Assina o infDPS (assinatura "irma" dentro de <DPS>), RSA-SHA256, c14n exclusiva.
function assinarDps(xml, id, cred) {
  var sig = new SignedXml({
    privateKey: cred.keyPem,
    publicCert: cred.certPem,
    signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
    canonicalizationAlgorithm: 'http://www.w3.org/2001/10/xml-exc-c14n#WithComments',
    getKeyInfoContent: function () { return '<X509Data><X509Certificate>' + certBase64(cred.certPem) + '</X509Certificate></X509Data>'; }
  });
  sig.addReference({
    xpath: "//*[local-name(.)='infDPS']",
    transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature', 'http://www.w3.org/2001/10/xml-exc-c14n#WithComments'],
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256'
  });
  sig.computeSignature(xml, { prefix: '', location: { reference: "//*[local-name(.)='infDPS']", action: 'after' } });
  return sig.getSignedXml();
}

function compactar(xml) { return zlib.gzipSync(Buffer.from(xml, 'utf8')).toString('base64'); }
function descompactar(b64) { return zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8'); }

// Chamada com mTLS. cred.pfx = Buffer, cred.senha = string
function chamar(ambiente, metodo, caminho, corpo, cred) {
  var base = URLS[ambiente === 'producao' ? 'producao' : 'homologacao'];
  var u = new URL(base + caminho);
  var dados = corpo ? Buffer.from(JSON.stringify(corpo), 'utf8') : null;
  return new Promise(function (resolve, reject) {
    var req = https.request({
      method: metodo, hostname: u.hostname, path: u.pathname + u.search, port: 443, pfx: cred.pfx, passphrase: cred.senha,
      headers: Object.assign({ Accept: 'application/json' }, dados ? { 'Content-Type': 'application/json', 'Content-Length': dados.length } : {}),
      timeout: 40000
    }, function (res) {
      var b = ''; res.on('data', function (c) { b += c; if (b.length > 5e6) req.destroy(new Error('Resposta grande demais.')); });
      res.on('end', function () { var j = null; try { j = b ? JSON.parse(b) : null; } catch (e) { } resolve({ status: res.statusCode, json: j, texto: j ? null : b.slice(0, 500) }); });
    });
    req.on('timeout', function () { req.destroy(new Error('Tempo esgotado ao falar com o Emissor Nacional.')); });
    req.on('error', reject);
    if (dados) req.write(dados);
    req.end();
  });
}

async function emitir(d, cred) {
  var m = montarDpsXml(d);
  var c = abrirPfx(cred.pfx, cred.senha);
  var assinado = assinarDps(m.xml, m.id, c);
  var r = await chamar(d.ambiente, 'POST', '/nfse', { dpsXmlGZipB64: compactar(assinado) }, cred);
  var j = r.json || {};
  if (j.chaveAcesso) return { ok: true, chaveAcesso: j.chaveAcesso, nfseXml: j.nfseXmlGZipB64 ? descompactar(j.nfseXmlGZipB64) : null, idDps: m.id };
  return { ok: false, status: r.status, codigo: j.codigo || null, mensagem: j.mensagem || r.texto || 'Recusada pelo Emissor Nacional.', erros: j.erros || null, idDps: m.id };
}

async function consultar(ambiente, chave, cred) {
  var r = await chamar(ambiente, 'GET', '/nfse/' + encodeURIComponent(chave), null, cred);
  var j = r.json || {};
  return { ok: r.status === 200 && !!j.chaveAcesso, status: r.status, chaveAcesso: j.chaveAcesso || null, nfseXml: j.nfseXmlGZipB64 ? descompactar(j.nfseXmlGZipB64) : null, mensagem: j.mensagem || null };
}

module.exports = { URLS, NS, validar, idDps, montarDpsXml, abrirPfx, assinarDps, compactar, descompactar, emitir, consultar };
