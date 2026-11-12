/* ============================================================
   licenca-guard.js — Trava de módulos por licença (v1)
   - Lê a licença da empresa (app_minha_licenca) e as permissões do usuário (app_meu_acesso).
   - Esconde/bloqueia as telas dos módulos que a empresa não contratou ou que o usuário não pode usar.
   - Mostra a faixa de aviso: degustação, vencendo, em carência, vencida, só Comunicação.
   - Bloqueio TOTAL: tela de bloqueio com botão Sair. Bloqueio PARCIAL: só consulta (não grava).
   - O Master nunca é afetado.
   - Se não conseguir consultar (erro de rede ou banco ainda sem as funções), NÃO trava nada.
   Carregado automaticamente pelo erp-core.js.
   ============================================================ */
(function () {
    'use strict';
    if (window.__licencaGuardCarregado) return;
    window.__licencaGuardCarregado = true;

    var pagina = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var PUBLICAS = ['login.html', 'cadastro.html', 'recuperar.html', 'registro.html'];
    if (PUBLICAS.indexOf(pagina) > -1) return;

    var FIXOS = ['dashboard', 'cadastros', 'comunicacao'];

    /* Qual módulo é dono de cada tela. Tela que não está aqui fica livre (Início, Cadastros, Ajuda, Usuários...). */
    var MAPA = {
        'dashboard.html': 'dashboard',
        'canal_contabil.html': 'comunicacao', 'documentos_contabeis.html': 'comunicacao', 'acessos_contabilidade.html': 'comunicacao',
        'modulo_financeiro.html': 'financeiro', 'aprovacao_pagamentos.html': 'financeiro', 'conciliacao.html': 'financeiro',
        'conciliacao_cartoes.html': 'financeiro', 'contas_bancarias.html': 'financeiro', 'contas_pagar.html': 'financeiro',
        'contas_receber.html': 'financeiro', 'contratos_recorrentes.html': 'financeiro', 'dre.html': 'financeiro',
        'extrato_analitico.html': 'financeiro', 'extrato_bancario.html': 'financeiro', 'faturas.html': 'financeiro',
        'fechamento_caixa.html': 'financeiro', 'fluxo_de_caixa.html': 'financeiro', 'orcamentos.html': 'financeiro',
        'relatorio_parceiros_financeiro.html': 'financeiro', 'relatorios.html': 'financeiro', 'transferencias.html': 'financeiro',
        'open_finance.html': 'financeiro',
        'modulo_contabil.html': 'contabil_fiscal', 'contabilidade.html': 'contabil_fiscal', 'fiscal_apuracao.html': 'contabil_fiscal',
        'fiscal_livros.html': 'contabil_fiscal', 'fiscal_notas.html': 'contabil_fiscal', 'fiscal_contabil.html': 'contabil_fiscal',
        'calendario_fiscal.html': 'contabil_fiscal', 'configuracoes_fiscais.html': 'contabil_fiscal',
        'certificados_digitais.html': 'contabil_fiscal', 'assinar_documento.html': 'contabil_fiscal',
        'produtos.html': 'catalogo_estoque', 'estoque.html': 'catalogo_estoque',
        'gestao_escritorio.html': 'escritorio_rh', 'folha_rh.html': 'escritorio_rh', 'juridico.html': 'escritorio_rh',
        'modulo_tecnologia_pd.html': 'tecnologia_pd', 'projetos_pd.html': 'tecnologia_pd', 'custos_pd.html': 'tecnologia_pd',
        'aportes_pd.html': 'tecnologia_pd', 'contratos_fomento.html': 'tecnologia_pd', 'fomento_contratos.html': 'tecnologia_pd',
        'faturamento_pd.html': 'tecnologia_pd', 'ativos_pd.html': 'tecnologia_pd', 'painel_saldos.html': 'tecnologia_pd',
        'relatorio_pd.html': 'tecnologia_pd',
        'cte.html': 'transporte',
        'auditoria_sistema.html': 'auditoria', 'logs.html': 'auditoria'
    };
    var NOMES = {
        dashboard: 'Dashboard & Indicadores', comunicacao: 'Comunicação', financeiro: 'Financeiro', contabil_fiscal: 'Contabilidade & Fiscal',
        catalogo_estoque: 'Catálogo & Estoque', escritorio_rh: 'Escritório, RH & Jurídico', tecnologia_pd: 'Tecnologia & P&D',
        transporte: 'Transporte & Logística', auditoria: 'Trilha de Auditoria'
    };
    /* No bloqueio parcial (só consulta) a comunicação continua livre, para o cliente conseguir falar com a contabilidade. */
    var LIVRES_PARCIAL = ['canal_contabil.html', 'documentos_contabeis.html'];

    var estado = { lic: null, acc: null, modulosLic: null };

    function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function dataBR(d) { return d ? String(d).slice(0, 10).split('-').reverse().join('/') : ''; }
    function usuario() { try { return JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); } catch (e) { return null; } }
    function arquivoDe(href) {
        try {
            var u = new URL(href, location.href);
            if (u.origin !== location.origin) return '';
            return (u.pathname.split('/').pop() || '').toLowerCase();
        } catch (e) { return ''; }
    }

    /* ---------- regras ---------- */
    function podeModulo(mod) {
        if (!mod) return { ok: true };
        var lic = estado.lic, acc = estado.acc;
        if (estado.modulosLic.indexOf(mod) < 0) return { ok: false, motivo: 'licenca' };
        if (FIXOS.indexOf(mod) < 0 && acc && !acc.acesso_total && (acc.modulos || []).indexOf(mod) < 0) return { ok: false, motivo: 'usuario' };
        return { ok: true };
    }
    function podePagina(pg) { return podeModulo(MAPA[pg]); }
    function contato() {
        return estado.lic && estado.lic.contabilidade_nome ? 'a contabilidade (' + estado.lic.contabilidade_nome + ')' : 'o suporte do Sacramento ERP';
    }

    /* ---------- aviso rápido ---------- */
    function toast(msg) {
        var d = document.getElementById('avisoLicencaCore');
        if (!d) {
            d = document.createElement('div'); d.id = 'avisoLicencaCore'; d.className = 'no-print';
            d.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#1e3a8a;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:2000001;box-shadow:0 8px 24px rgba(0,0,0,.3);max-width:90%;text-align:center;';
            document.body.appendChild(d);
        }
        d.textContent = msg; d.style.display = 'block';
        clearTimeout(d.__t); d.__t = setTimeout(function () { d.style.display = 'none'; }, 4800);
    }
    function msgBloqueioModulo(mod, motivo) {
        var n = NOMES[mod] || 'este módulo';
        return motivo === 'usuario'
            ? 'Você não tem permissão para usar o módulo ' + n + '. Fale com o administrador da sua empresa.'
            : 'O módulo ' + n + ' não faz parte da licença da sua empresa. Fale com ' + contato() + ' para contratar.';
    }

    /* ---------- tela de bloqueio ---------- */
    function telaBloqueio(titulo, texto, mostrarInicio) {
        if (document.getElementById('telaLicencaCore')) return;
        var d = document.createElement('div'); d.id = 'telaLicencaCore'; d.className = 'no-print';
        d.style.cssText = 'position:fixed;inset:0;z-index:2000000;background:#f1f5f9;display:flex;align-items:center;justify-content:center;padding:20px;font-family:inherit;';
        d.innerHTML = '<div style="background:#fff;max-width:520px;width:100%;border-radius:16px;padding:34px 30px;box-shadow:0 20px 50px rgba(15,23,42,.18);text-align:center;border-top:5px solid #dc2626;">' +
            '<div style="font-size:38px;color:#dc2626;margin-bottom:10px;"><i class="fas fa-lock"></i></div>' +
            '<h2 style="margin:0 0 10px;color:#0f172a;font-size:20px;">' + esc(titulo) + '</h2>' +
            '<p style="margin:0 0 22px;color:#475569;font-size:14px;line-height:1.55;">' + esc(texto) + '</p>' +
            '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
            (mostrarInicio ? '<a href="index.html" style="background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:9px;font-weight:700;font-size:13px;"><i class="fas fa-home"></i> Voltar ao início</a>' : '') +
            '<button type="button" id="btnSairLicencaCore" style="background:#dc2626;color:#fff;border:none;padding:10px 18px;border-radius:9px;font-weight:700;font-size:13px;cursor:pointer;"><i class="fas fa-sign-out-alt"></i> Sair</button>' +
            '</div></div>';
        document.body.appendChild(d);
        document.body.style.overflow = 'hidden';
        document.getElementById('btnSairLicencaCore').onclick = function () {
            if (typeof window.sairSistemaCore === 'function') window.sairSistemaCore();
            else { try { localStorage.removeItem('usuarioLogado'); } catch (e) {} location.href = 'login.html'; }
        };
    }

    /* ---------- faixa de aviso ---------- */
    function faixa(cor, icone, html, fechavel) {
        if (document.getElementById('faixaLicencaCore')) return;
        var chave = 'faixaLicFechada_' + new Date().toISOString().slice(0, 10);
        if (fechavel) { try { if (sessionStorage.getItem(chave)) return; } catch (e) {} }
        var cores = { azul: ['#dbeafe', '#1e3a8a', '#3b82f6'], amarelo: ['#fef3c7', '#78350f', '#f59e0b'], vermelho: ['#fee2e2', '#7f1d1d', '#ef4444'], cinza: ['#e2e8f0', '#1e293b', '#64748b'] };
        var c = cores[cor] || cores.azul;
        var d = document.createElement('div'); d.id = 'faixaLicencaCore'; d.className = 'no-print';
        d.style.cssText = 'background:' + c[0] + ';color:' + c[1] + ';border-bottom:2px solid ' + c[2] + ';padding:9px 28px;display:flex;justify-content:space-between;align-items:center;gap:14px;font-size:12.5px;line-height:1.45;flex-wrap:wrap;';
        d.innerHTML = '<span><i class="fas ' + icone + '"></i> ' + html + '</span>' +
            (fechavel ? '<button type="button" style="background:transparent;border:1px solid ' + c[2] + ';color:' + c[1] + ';border-radius:8px;padding:4px 10px;font-size:11.5px;font-weight:700;cursor:pointer;">Entendi</button>' : '');
        var header = document.querySelector('.site-header');
        if (header) header.insertAdjacentElement('afterend', d); else document.body.insertAdjacentElement('afterbegin', d);
        if (fechavel) d.querySelector('button').onclick = function () { try { sessionStorage.setItem(chave, '1'); } catch (e) {} d.remove(); };
    }
    function montarFaixa() {
        var l = estado.lic, sit = l.situacao, extra = l.bloqueio === 'parcial' ? ' <b>Acesso limitado: somente consulta.</b>' : '';
        var dias = l.dias_para_vencer;
        if (sit === 'degustacao') {
            faixa(dias != null && dias <= 5 ? 'amarelo' : 'azul', 'fa-gift',
                '<b>Período de degustação:</b> todos os módulos liberados ' + (dias === 0 ? 'até hoje' : 'por mais ' + dias + ' dia(s)') + ' (até ' + dataBR(l.vencimento) + '). Para continuar depois, fale com ' + esc(contato()) + '.', true);
        } else if (sit === 'degustacao_encerrada') {
            faixa('vermelho', 'fa-hourglass-end', '<b>Sua degustação terminou.</b> Por enquanto só o módulo <b>Comunicação</b> está ativo (seus dados continuam guardados). Para liberar os demais módulos, fale com ' + esc(contato()) + '.', false);
        } else if (sit === 'comunicacao') {
            faixa('cinza', 'fa-comments', 'Nesta empresa está ativo apenas o módulo <b>Comunicação</b> (Canal e Documentos Contábeis). Para liberar outros módulos, fale com ' + esc(contato()) + '.', true);
        } else if (sit === 'vence_em_breve') {
            faixa('amarelo', 'fa-bell', '<b>Sua licença vence ' + (dias === 0 ? 'hoje' : 'em ' + dias + ' dia(s)') + '</b> (' + dataBR(l.vencimento) + '). Regularize o pagamento para não ter o acesso limitado.' + extra, true);
        } else if (sit === 'em_carencia') {
            faixa('amarelo', 'fa-triangle-exclamation', '<b>Licença vencida em ' + dataBR(l.vencimento) + '.</b> Você está no prazo para regularizar' + (l.limite_carencia ? ' (até ' + dataBR(l.limite_carencia) + ')' : '') + '. Depois disso o acesso poderá ser limitado.' + extra, false);
        } else if (sit === 'vencida') {
            faixa('vermelho', 'fa-circle-exclamation', '<b>Licença vencida desde ' + dataBR(l.vencimento) + '.</b> Regularize o pagamento com ' + esc(contato()) + ' para evitar bloqueio.' + extra, false);
        } else if (l.bloqueio === 'parcial') {
            faixa('vermelho', 'fa-lock', '<b>Acesso limitado: somente consulta.</b> Fale com ' + esc(contato()) + '.', false);
        }
    }

    /* ---------- bloqueio parcial: só consulta ---------- */
    function instalarSoConsulta() {
        if (LIVRES_PARCIAL.indexOf(pagina) > -1) return;
        var VERBOS = /(salvar|gravar|excluir|remover|apagar|deletar|cadastrar|incluir|adicionar|\bnov[oa]\b|editar|alterar|importar|lan[cç]ar|emitir|aprovar|reprovar|liquidar|quitar|estornar|conciliar|transmitir|criar|duplicar|restaurar|confirmar|registrar|registar|enviar)/i;
        var LIVRES = /(imprimir|print|pdf|csv|excel|exportar|filtrar|buscar|pesquisar|voltar|fechar|cancelar|limpar|aplicar|visualizar|detalhe|consultar|sair)/i;
        var MSG = 'Acesso limitado (somente consulta) por pendência na licença. Fale com ' + contato() + '.';
        document.addEventListener('click', function (e) {
            var el = e.target && e.target.closest ? e.target.closest('button, a, input[type="submit"], input[type="button"], [onclick]') : null;
            if (!el || el.closest('.site-header, .search-global-box, #modalAlterarSenhaCore, #telaLicencaCore, #faixaLicencaCore, #faixaConsultaCore')) return;
            var visivel = (el.innerText || el.value || '').trim();
            if (LIVRES.test(visivel)) return;
            var texto = visivel + ' ' + (el.getAttribute('onclick') || '') + ' ' + (el.getAttribute('title') || '');
            if (VERBOS.test(texto)) { e.preventDefault(); e.stopImmediatePropagation(); toast(MSG); }
        }, true);
        document.addEventListener('submit', function (e) {
            if (e.target && e.target.closest && e.target.closest('#modalAlterarSenhaCore, #telaLicencaCore')) return;
            e.preventDefault(); e.stopImmediatePropagation(); toast(MSG);
        }, true);
    }

    /* ---------- links para módulos indisponíveis ---------- */
    function marcarLinks() {
        var links = document.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            if (a.__licMarcado) continue;
            var pg = arquivoDe(a.getAttribute('href'));
            var r = pg ? podePagina(pg) : { ok: true };
            a.__licMarcado = true;
            if (r.ok) continue;
            if (a.classList.contains('portal-card')) a.style.display = 'none';
            else { a.style.opacity = '.45'; a.title = msgBloqueioModulo(MAPA[pg], r.motivo); }
        }
    }
    function instalarCliqueLinks() {
        document.addEventListener('click', function (e) {
            var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
            if (!a) return;
            var pg = arquivoDe(a.getAttribute('href'));
            if (!pg) return;
            var r = podePagina(pg);
            if (!r.ok) { e.preventDefault(); e.stopImmediatePropagation(); toast(msgBloqueioModulo(MAPA[pg], r.motivo)); }
        }, true);
        var t = null;
        try {
            new MutationObserver(function () { clearTimeout(t); t = setTimeout(marcarLinks, 250); }).observe(document.body, { childList: true, subtree: true });
        } catch (e) {}
    }

    /* ---------- início ---------- */
    function aplicar() {
        var lic = estado.lic;
        estado.modulosLic = (lic.modulos && lic.modulos.length) ? lic.modulos : FIXOS.slice();

        if (lic.bloqueio === 'total') {
            telaBloqueio('Acesso bloqueado', 'O acesso desta empresa está bloqueado por pendência na licença. Fale com ' + contato() + ' para regularizar.', false);
            return;
        }
        var r = podePagina(pagina);
        if (!r.ok) {
            var mod = MAPA[pagina];
            telaBloqueio(r.motivo === 'usuario' ? 'Sem permissão para este módulo' : 'Módulo não contratado', msgBloqueioModulo(mod, r.motivo), true);
        }
        montarFaixa();
        marcarLinks();
        instalarCliqueLinks();
        if (lic.bloqueio === 'parcial') instalarSoConsulta();
    }

    function consultar(sb) {
        var u = usuario(); if (!u) return;
        var chave = 'licGuardCache_' + String(u.email || '').toLowerCase();
        try {
            var c = JSON.parse(sessionStorage.getItem(chave) || 'null');
            if (c && c.ts && (Date.now() - c.ts) < 60000) { estado.lic = c.lic; estado.acc = c.acc; aplicar(); return; }
        } catch (e) {}
        Promise.all([sb.rpc('app_minha_licenca'), sb.rpc('app_meu_acesso')]).then(function (rs) {
            var rl = rs[0], ra = rs[1];
            if (!rl || rl.error || !rl.data || !rl.data.length) return;   // não conseguiu consultar: não trava nada
            var lic = rl.data[0], acc = (ra && !ra.error && ra.data && ra.data[0]) || null;
            if (lic.tipo === 'master' || (acc && acc.is_master)) return;  // Master nunca é afetado
            try { sessionStorage.setItem(chave, JSON.stringify({ ts: Date.now(), lic: lic, acc: acc })); } catch (e) {}
            estado.lic = lic; estado.acc = acc;
            aplicar();
        }).catch(function () {});
    }

    function iniciar() {
        var u = usuario(); if (!u) return;
        if (String(u.email || '').toLowerCase().trim() === 'lucianojorgesacramento@gmail.com') return;   // Master
        var tent = 0;
        (function esperar() {
            if (window.sb && window.sb.rpc) { consultar(window.sb); return; }
            /* algumas telas guardam a conexão em variável própria (não em window.sb): depois de ~1 s criamos a nossa, que compartilha o mesmo login */
            if (tent >= 6 && window.supabase && window.supabase.createClient) {
                try {
                    consultar(window.supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei'));
                    return;
                } catch (e) {}
            }
            if (++tent < 40) setTimeout(esperar, 150);
        })();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
