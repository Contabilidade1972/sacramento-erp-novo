/* ============================================================
   build-ambiente.js — Sacramento ERP
   Roda sozinho no Vercel, na hora de publicar o site (nao precisa rodar na mao).
   - Ramificacao "homologacao": troca o endereco/chave do banco de PRODUCAO pelos do banco de TESTES
     em todas as telas e coloca a faixa vermelha "AMBIENTE DE TESTES".
   - Qualquer outra ramificacao (main = producao): NAO FAZ NADA.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ref = process.env.VERCEL_GIT_COMMIT_REF || process.env.AMBIENTE_FORCADO || '';
if (ref !== 'homologacao') {
  console.log('[ambiente] producao (ramificacao "' + ref + '"): nada a fazer.');
  process.exit(0);
}

const PROD_REF = 'vcuhkvqrbkyulnnyqnbf';
const PROD_KEY = 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei';
const HML_REF = 'inzjdgighrzwtypppmqb';
const HML_KEY = 'sb_publishable_CLc3LLHN9HtnKUR01vzaiw_cQkvXnck';

const FAIXA = '<script>(function(){try{document.title="[TESTE] "+document.title;var d=document.createElement("div");' +
  'd.textContent="AMBIENTE DE TESTES — dados fictícios";d.setAttribute("style","position:fixed;top:0;left:50%;transform:translateX(-50%);' +
  'background:#dc2626;color:#fff;font:700 11px Inter,Arial,sans-serif;padding:3px 16px;border-radius:0 0 8px 8px;z-index:2147483647;pointer-events:none;letter-spacing:.4px;");' +
  'd.className="no-print";var s=document.createElement("style");s.textContent="@media print{.no-print{display:none!important}}";' +
  'function p(){document.head.appendChild(s);document.body.appendChild(d);}' +
  'if(document.body)p();else document.addEventListener("DOMContentLoaded",p);}catch(e){}})();</script>';

const IGNORAR = ['node_modules', '.git', '.vercel'];
let n = 0, tocados = 0;

function percorrer(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (IGNORAR.indexOf(e.name) < 0) percorrer(p); return; }
    if (e.name === 'build-ambiente.js') return;
    if (!/\.(html|js)$/i.test(e.name)) return;
    let s = fs.readFileSync(p, 'utf8');
    const o = s;
    s = s.split(PROD_REF).join(HML_REF).split(PROD_KEY).join(HML_KEY);
    if (/\.html$/i.test(e.name) && s.indexOf('AMBIENTE DE TESTES') < 0) {
      s = /<\/head>/i.test(s) ? s.replace(/<\/head>/i, FAIXA + '</head>') : FAIXA + s;
    }
    n++;
    if (s !== o) { fs.writeFileSync(p, s); tocados++; }
  });
}
percorrer(process.cwd());
console.log('[ambiente] HOMOLOGACAO: ' + tocados + ' de ' + n + ' arquivos ajustados para o banco de testes.');
