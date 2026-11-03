/* ============================================================
   Sacramento ERP — erp-print.js v1.1
   Padrão ÚNICO de impressão de relatórios.
   - Cabeçalho com empresa, CNPJ, título e identificação do relatório
   - Quadro "Filtros aplicados"
   - Resumo (totais) e tabela com cabeçalho repetido em todas as páginas
   - Rodapé com "Página X de Y" REAIS, usuário e data/hora de emissão
   - Independente do restante da tela (imprime num documento próprio)

   USO:
   ERPPrint.imprimir({
     titulo:   'Relatório de Contas a Pagar',
     codigo:   'FIN-CP',                       // identifica o tipo de relatório
     orientacao: 'landscape',                  // 'landscape' | 'portrait'
     filtros:  [['Período','01/01/2026 a 31/12/2026'], ['Status','Todos']],
     resumo:   [['Títulos','12'], ['Valor total','R$ 1.000,00']],
     colunas:  [{t:'Código', w:1}, {t:'Valor (R$)', w:2, a:'right'}],
     linhas:   [ ['CP-001','R$ 10,00'], {c:['CP-002',{t:'R$ 5,00',cls:'neg'}], cls:'destaque'} ],
     totais:   ['TOTAL','R$ 15,00'],           // opcional, alinhada às colunas
     observacao: 'Texto opcional no fim',
     assinaturas: ['Responsável pelo pagamento', 'Aprovação']   // opcional: bloco de assinaturas na última página
   });
   ============================================================ */
(function (w) {
    'use strict';

    var MM = 96 / 25.4; // pixels por milímetro

    function esc(s) {
        return String(s === null || s === undefined ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    function fmtBRL(v) {
        var n = parseFloat(v);
        if (isNaN(n)) n = 0;
        return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // 'AAAA-MM-DD' (ou ISO com hora) -> 'DD/MM/AAAA'. Não usa Date (evita erro de fuso).
    function fmtData(iso) {
        if (!iso) return '—';
        var s = String(iso).substring(0, 10).split('-');
        return s.length === 3 ? s[2] + '/' + s[1] + '/' + s[0] : String(iso);
    }

    function hojeISO() { // data LOCAL (não UTC)
        var d = new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function usuarioLogado() {
        try { return JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); } catch (e) { return null; }
    }

    function nomeEmpresa() {
        var el = document.getElementById('brandTitleCore') || document.getElementById('brandTitle') ||
                 document.querySelector('.site-brand .brand-info h1') || document.querySelector('header h1');
        var t = el && el.innerText ? el.innerText.trim() : '';
        return t || 'Sacramento ERP';
    }

    function buscarCnpj(cfg) {
        return new Promise(function (resolve) {
            if (cfg.cnpj) { resolve(cfg.cnpj); return; }
            var timer = setTimeout(function () { resolve(''); }, 2500);
            try {
                var cli = w.sb || w.sbGlobal;
                var cid = (typeof w.clienteIdAtual === 'function') ? w.clienteIdAtual() : null;
                if (!cli || !cid) { clearTimeout(timer); resolve(''); return; }
                cli.from('clientes_contratantes').select('cnpj').eq('id', cid).maybeSingle()
                    .then(function (r) {
                        clearTimeout(timer);
                        resolve(r && r.data && r.data.cnpj ? String(r.data.cnpj) : '');
                    }, function () { clearTimeout(timer); resolve(''); });
            } catch (e) { clearTimeout(timer); resolve(''); }
        });
    }

    var CSS = [
        '@page { size: __PAGESIZE__; margin: 0; }',
        '* { box-sizing: border-box; margin: 0; padding: 0; }',
        'html, body { background: #fff; }',
        'body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #0f172a; font-size: 8.5pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
        '.pagina { position: relative; width: __W__mm; height: __H__mm; padding: 10mm 12mm 0 12mm; overflow: hidden; page-break-after: always; break-after: page; background: #fff; }',
        '.pagina:last-child { page-break-after: auto; break-after: auto; }',
        /* topo completo (1ª página) */
        '.topo-cheio { border-bottom: 2.2px solid #1e3a8a; padding-bottom: 3.5mm; margin-bottom: 3.5mm; }',
        '.topo-linha { display: flex; justify-content: space-between; align-items: flex-start; gap: 8mm; }',
        '.emp-nome { font-size: 14pt; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: .2px; line-height: 1.15; }',
        '.emp-cnpj { font-size: 8pt; color: #475569; margin-top: 1mm; }',
        '.id-bloco { text-align: right; font-size: 7.5pt; color: #475569; line-height: 1.5; white-space: nowrap; }',
        '.id-bloco b { color: #0f172a; }',
        '.titulo-rel { margin-top: 3.5mm; font-size: 12.5pt; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: .4px; }',
        '.sub-rel { font-size: 8pt; color: #64748b; margin-top: .8mm; }',
        /* topo compacto (páginas seguintes) */
        '.topo-mini { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1.4px solid #1e3a8a; padding-bottom: 1.8mm; margin-bottom: 3mm; font-size: 8pt; }',
        '.topo-mini .m1 { font-weight: 800; color: #1e3a8a; text-transform: uppercase; }',
        '.topo-mini .m2 { color: #475569; }',
        /* filtros */
        '.filtros { border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 1.5mm; padding: 2mm 3mm; margin-bottom: 3mm; font-size: 8pt; line-height: 1.55; }',
        '.filtros .f-tit { font-size: 7pt; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: .6px; margin-bottom: .6mm; }',
        '.filtros .f-item { display: inline-block; margin-right: 5mm; white-space: nowrap; }',
        '.filtros .f-item b { color: #1e3a8a; }',
        '.filtros .f-nenhum { color: #64748b; font-style: italic; }',
        /* resumo */
        '.resumo { display: flex; gap: 2.5mm; margin-bottom: 3.5mm; }',
        '.res-card { flex: 1 1 0; border: 1px solid #cbd5e1; border-left: 3px solid #1e3a8a; border-radius: 1.5mm; padding: 1.8mm 2.6mm; background: #fff; }',
        '.res-card .r-t { font-size: 6.6pt; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }',
        '.res-card .r-v { font-size: 10.5pt; font-weight: 800; color: #0f172a; margin-top: .6mm; }',
        /* tabela */
        'table.rel { width: 100%; border-collapse: collapse; table-layout: fixed; }',
        'table.rel thead th { background: #1e3a8a; color: #fff; font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; padding: 2mm 1.6mm; text-align: left; border: 0; }',
        'table.rel tbody td { padding: 1.7mm 1.6mm; border-bottom: 1px solid #dbe3ee; vertical-align: top; word-wrap: break-word; overflow-wrap: anywhere; line-height: 1.3; }',
        'table.rel tbody tr:nth-child(even) td { background: #f6f8fc; }',
        'table.rel tbody tr.destaque td { background: #fffbeb; }',
        'table.rel tr.linha-total td { border-top: 1.6px solid #1e3a8a; border-bottom: 0; background: #eef2ff !important; font-weight: 800; padding-top: 2mm; padding-bottom: 2mm; }',
        '.a-right { text-align: right !important; } .a-center { text-align: center !important; }',
        '.pos { color: #047857; font-weight: 700; } .neg { color: #b91c1c; font-weight: 700; } .warn { color: #b45309; font-weight: 700; } .muted { color: #64748b; } .bold { font-weight: 700; }',
        '.vazio { text-align: center; color: #64748b; padding: 8mm 0 !important; font-style: italic; }',
        '.obs { margin-top: 3mm; font-size: 7.5pt; color: #475569; border-left: 3px solid #cbd5e1; padding-left: 2.5mm; line-height: 1.5; }',
        '.fim { margin-top: 3mm; text-align: center; font-size: 7pt; color: #94a3b8; letter-spacing: 1.2px; text-transform: uppercase; }',
        /* rodapé */
        '.rodape { position: absolute; left: 12mm; right: 12mm; bottom: 7mm; border-top: 1px solid #94a3b8; padding-top: 1.6mm; display: flex; justify-content: space-between; gap: 6mm; font-size: 7pt; color: #64748b; }',
        '.rodape .r-meio { flex: 1; text-align: center; }',
        '.rodape .r-pag { font-weight: 800; color: #0f172a; white-space: nowrap; }',
        '.assin { display: flex; gap: 14mm; margin-top: 16mm; padding: 0 6mm; }',
        '.assin .a-cx { flex: 1 1 0; border-top: 1px solid #0f172a; padding-top: 1.4mm; text-align: center; font-size: 7.5pt; color: #334155; }',
        '.sonda { position: absolute; left: -99999px; top: 0; visibility: hidden; }'
    ].join('\n');

    function montarTopoCheio(m) {
        var h = '<div class="topo-cheio">' +
            '<div class="topo-linha">' +
              '<div><div class="emp-nome">' + esc(m.empresa) + '</div>' +
              (m.cnpj ? '<div class="emp-cnpj">CNPJ: ' + esc(m.cnpj) + '</div>' : '') + '</div>' +
              '<div class="id-bloco">' +
                '<div>Relatório: <b>' + esc(m.codigo) + '</b></div>' +
                '<div>Documento nº <b>' + esc(m.docId) + '</b></div>' +
                '<div>Emitido em <b>' + esc(m.emissao) + '</b></div>' +
                '<div>Por <b>' + esc(m.usuario) + '</b></div>' +
              '</div>' +
            '</div>' +
            '<div class="titulo-rel">' + esc(m.titulo) + '</div>' +
            (m.subtitulo ? '<div class="sub-rel">' + esc(m.subtitulo) + '</div>' : '') +
          '</div>';

        var f = '<div class="filtros"><div class="f-tit">Filtros aplicados</div>';
        if (m.filtros.length) {
            m.filtros.forEach(function (p) { f += '<span class="f-item">' + esc(p[0]) + ': <b>' + esc(p[1]) + '</b></span>'; });
        } else {
            f += '<span class="f-nenhum">Nenhum filtro aplicado — todos os registros.</span>';
        }
        f += '</div>';

        var r = '';
        if (m.resumo.length) {
            r = '<div class="resumo">';
            m.resumo.forEach(function (p) {
                r += '<div class="res-card"><div class="r-t">' + esc(p[0]) + '</div><div class="r-v">' + esc(p[1]) + '</div></div>';
            });
            r += '</div>';
        }
        return h + f + r;
    }

    function montarTopoMini(m) {
        return '<div class="topo-mini"><span class="m1">' + esc(m.empresa) + ' — ' + esc(m.titulo) + '</span>' +
               '<span class="m2">' + esc(m.codigo) + ' · Doc. ' + esc(m.docId) + '</span></div>';
    }

    function celulaHTML(c, col) {
        var txt, cls = '';
        if (c && typeof c === 'object') { txt = c.t; cls = c.cls || ''; } else { txt = c; }
        var a = col.a ? ' a-' + col.a : '';
        return '<td class="' + (cls + a).trim() + '">' + esc(txt === undefined || txt === null || txt === '' ? '—' : txt) + '</td>';
    }

    function linhaHTML(l, cols) {
        var cels = Array.isArray(l) ? l : l.c;
        var cls = Array.isArray(l) ? '' : (l.cls || '');
        var h = '<tr' + (cls ? ' class="' + cls + '"' : '') + '>';
        for (var i = 0; i < cols.length; i++) h += celulaHTML(cels[i], cols[i]);
        return h + '</tr>';
    }

    function totalHTML(tot, cols) {
        var h = '<tr class="linha-total">';
        for (var i = 0; i < cols.length; i++) {
            var v = tot[i];
            var a = cols[i].a ? ' class="a-' + cols[i].a + '"' : '';
            h += '<td' + a + '>' + esc(v === undefined || v === null ? '' : (typeof v === 'object' ? v.t : v)) + '</td>';
        }
        return h + '</tr>';
    }

    function colgroupHTML(cols) {
        var soma = 0, i;
        for (i = 0; i < cols.length; i++) soma += (cols[i].w || 1);
        var h = '<colgroup>';
        for (i = 0; i < cols.length; i++) h += '<col style="width:' + (((cols[i].w || 1) / soma) * 100).toFixed(3) + '%">';
        return h + '</colgroup>';
    }

    function theadHTML(cols) {
        var h = '<thead><tr>';
        cols.forEach(function (c) { h += '<th' + (c.a ? ' class="a-' + c.a + '"' : '') + '>' + esc(c.t) + '</th>'; });
        return h + '</tr></thead>';
    }

    function paginar(doc, cfg, m) {
        var land = m.orientacao === 'landscape';
        var Wmm = land ? 297 : 210, Hmm = land ? 210 : 297;
        var larguraUtilPx = (Wmm - 24) * MM;
        // Área útil vertical: topo 10mm; reservado embaixo 17mm (rodapé + folga)
        var alturaUtilPx = (Hmm - 10 - 17) * MM;
        var cols = cfg.colunas;
        var linhas = cfg.linhas || [];
        var totais = cfg.totais || null;

        var body = doc.body;
        var sonda = doc.createElement('div');
        sonda.className = 'sonda';
        sonda.style.width = larguraUtilPx + 'px';

        var linhasHtml = linhas.map(function (l) { return linhaHTML(l, cols); });
        var totalHtml = totais ? totalHTML(totais, cols) : '';
        sonda.innerHTML =
            '<div id="s-cheio">' + montarTopoCheio(m) + '</div>' +
            '<div id="s-mini">' + montarTopoMini(m) + '</div>' +
            '<table class="rel" id="s-tab">' + colgroupHTML(cols) + theadHTML(cols) +
            '<tbody>' + (linhasHtml.length ? linhasHtml.join('') : '<tr><td class="vazio" colspan="' + cols.length + '">Nenhum registro encontrado com os filtros aplicados.</td></tr>') +
            (totalHtml) + '</tbody></table>';
        body.appendChild(sonda);

        var hCheio = doc.getElementById('s-cheio').offsetHeight;
        var hMini = doc.getElementById('s-mini').offsetHeight + 4;
        var tab = doc.getElementById('s-tab');
        var hHead = tab.querySelector('thead').offsetHeight;
        var trs = tab.querySelectorAll('tbody tr');
        var hs = [];
        for (var i = 0; i < trs.length; i++) hs.push(trs[i].offsetHeight);
        body.removeChild(sonda);

        var temLinhas = linhasHtml.length > 0;
        var itens = []; // { html, h, total }
        if (temLinhas) {
            for (var k = 0; k < linhasHtml.length; k++) itens.push({ html: linhasHtml[k], h: hs[k] });
            if (totalHtml) itens.push({ html: totalHtml, h: hs[hs.length - 1], total: true });
        } else {
            itens.push({ html: '<tr><td class="vazio" colspan="' + cols.length + '">Nenhum registro encontrado com os filtros aplicados.</td></tr>', h: hs[0] || 40 });
        }

        // Reserva para observação + "fim do relatório" na última página
        var reservaFim = (cfg.observacao ? 14 * MM : 0) + 8 * MM + ((cfg.assinaturas && cfg.assinaturas.length) ? 24 * MM : 0);

        var paginas = [], atual = [], usado = 0, limite = alturaUtilPx - hCheio - hHead - 4;
        for (var j = 0; j < itens.length; j++) {
            var it = itens[j];
            var ultimo = (j === itens.length - 1);
            var cabe = usado + it.h <= limite - (ultimo ? reservaFim : 0);
            // a linha de TOTAL nunca fica sozinha: leva a última linha de dados junto
            if (it.total && !cabe && atual.length > 1) {
                var mover = atual.pop();
                paginas.push(atual);
                atual = [mover]; usado = mover.h;
                limite = alturaUtilPx - hMini - hHead - 4;
                atual.push(it); usado += it.h;
                continue;
            }
            if (!cabe && atual.length > 0) {
                paginas.push(atual);
                atual = []; usado = 0;
                limite = alturaUtilPx - hMini - hHead - 4;
            }
            atual.push(it); usado += it.h;
        }
        paginas.push(atual);

        var totalPag = paginas.length;
        var html = '';
        paginas.forEach(function (pg, idx) {
            var primeira = idx === 0, ultima = idx === totalPag - 1;
            html += '<div class="pagina">' +
                (primeira ? montarTopoCheio(m) : montarTopoMini(m)) +
                '<table class="rel">' + colgroupHTML(cols) + theadHTML(cols) + '<tbody>' +
                pg.map(function (x) { return x.html; }).join('') + '</tbody></table>' +
                (ultima && cfg.observacao ? '<div class="obs">' + esc(cfg.observacao) + '</div>' : '') +
                (ultima && cfg.assinaturas && cfg.assinaturas.length ? '<div class="assin">' + cfg.assinaturas.map(function (a) { return '<div class="a-cx">' + esc(a) + '</div>'; }).join('') + '</div>' : '') +
                (ultima ? '<div class="fim">— Fim do relatório —</div>' : '') +
                '<div class="rodape">' +
                  '<span>' + esc(m.empresa) + ' · ' + esc(m.codigo) + '</span>' +
                  '<span class="r-meio">Sacramento ERP · Emitido por ' + esc(m.usuario) + ' em ' + esc(m.emissao) + '</span>' +
                  '<span class="r-pag">Página ' + (idx + 1) + ' de ' + totalPag + '</span>' +
                '</div></div>';
        });
        body.innerHTML = html;
        return totalPag;
    }

    function imprimir(cfg) {
        cfg = cfg || {};
        cfg.colunas = cfg.colunas || [];
        var u = usuarioLogado();
        var agora = new Date();
        var emissao = pad(agora.getDate()) + '/' + pad(agora.getMonth() + 1) + '/' + agora.getFullYear() + ' ' + pad(agora.getHours()) + ':' + pad(agora.getMinutes());
        var docId = '' + agora.getFullYear() + pad(agora.getMonth() + 1) + pad(agora.getDate()) + '-' +
                    pad(agora.getHours()) + pad(agora.getMinutes()) + pad(agora.getSeconds());
        var land = (cfg.orientacao || (cfg.colunas.length > 7 ? 'landscape' : 'portrait')) === 'landscape';

        return buscarCnpj(cfg).then(function (cnpj) {
            var m = {
                empresa: cfg.empresa || nomeEmpresa(),
                cnpj: cnpj,
                titulo: cfg.titulo || 'Relatório',
                subtitulo: cfg.subtitulo || '',
                codigo: cfg.codigo || 'REL',
                docId: docId,
                emissao: emissao,
                usuario: u ? (u.nome || u.email || 'Usuário') : 'Usuário',
                filtros: cfg.filtros || [],
                resumo: cfg.resumo || [],
                orientacao: land ? 'landscape' : 'portrait'
            };

            var old = document.getElementById('erpPrintFrame');
            if (old && old.parentNode) old.parentNode.removeChild(old);
            var fr = document.createElement('iframe');
            fr.id = 'erpPrintFrame';
            fr.setAttribute('aria-hidden', 'true');
            fr.style.cssText = 'position:fixed;left:-99999px;top:0;width:' + (land ? 297 : 210) + 'mm;height:' + (land ? 210 : 297) + 'mm;border:0;visibility:hidden;';
            document.body.appendChild(fr);
            var doc = fr.contentWindow.document;
            doc.open();
            doc.write('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>' + esc(m.titulo + ' — ' + m.empresa) + '</title><style>' +
                CSS.replace('__PAGESIZE__', 'A4 ' + (land ? 'landscape' : 'portrait'))
                   .replace('__W__', land ? 297 : 210).replace('__H__', land ? 210 : 297) +
                '</style></head><body></body></html>');
            doc.close();

            var total = paginar(doc, cfg, m);

            if (cfg.semDialogo) return { iframe: fr, paginas: total, meta: m };

            // Nome sugerido do PDF = título da aba durante a impressão
            var tituloAntigo = document.title;
            var nomeArq = (m.titulo + ' - ' + m.empresa + ' - ' + emissao.substring(0, 10).split('/').reverse().join('-')).replace(/[\\\/:*?"<>|]/g, '');
            document.title = nomeArq;
            function restaurar() {
                document.title = tituloAntigo;
                setTimeout(function () { if (fr.parentNode) fr.parentNode.removeChild(fr); }, 500);
            }
            try {
                fr.contentWindow.addEventListener('afterprint', restaurar);
                fr.contentWindow.focus();
                fr.contentWindow.print();
            } catch (e) { restaurar(); throw e; }
            setTimeout(restaurar, 120000);
            return { paginas: total };
        });
    }

    w.ERPPrint = { imprimir: imprimir, fmtBRL: fmtBRL, fmtData: fmtData, hojeISO: hojeISO, esc: esc };
})(window);
