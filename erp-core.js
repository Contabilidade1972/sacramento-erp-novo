/* ============================================================
    erp-core.js — Motor Central v6.5 (DEFINITIVO & BLINDADO MULTI-TENANT)
    - v7.0: AVISO DE CERTIFICADO DIGITAL VENCIDO / A VENCER no topo de todas as páginas (+ rota de busca)
    - v6.9: ASSISTENTE DE IA (chat de ajuda) — carrega assistente-ia.js
    - v6.8: GUARDA DE SESSÃO REAL (login do Supabase + código de 6 números para o Master) em todas as páginas
    - v6.7: APLICATIVO INSTALÁVEL (PWA) + AJUSTE PARA CELULAR — carrega pwa.js (manifesto, ícones, service worker, botão Instalar e CSS mobile)
    - White-Label lê de configuracoes_sistema (fonte única)
    - Reusa a conexão única window.sb (nunca cria outra)
    - Relógio próprio (fim da data estática)
    - Remove cabeçalhos duplicados com blindagem total
    - Lista completa de módulos + busca global corrigida
    - Limpa filtro pré-preenchido com e-mail do usuário
    - Impressão v6.2: margens compactas, cabeçalho repetido
    - Blindagem Multi-Tenant: Tenant estrito por usuário (LGPD)
    - v6.5: busca do topo corrigida (Calendário Fiscal, Contabilidade, DRE) + Documentos Contábeis e Registro de Acessos
    - v6.4: PERFIL CONTABILIDADE — seletor de clientes vinculados, modo consulta
      (somente leitura), faixa de aviso e registro de acessos (LGPD)
   ============================================================ */
(function() {
    'use strict';
    var styleId = 'erp-core-styles-universal-v56';
    if (!document.getElementById(styleId)) {
        var style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            :root { --primary:#2563eb; --primary-dark:#1d4ed8; --secondary:#1e3a8a; --success:#10b981; --bg:#f8fafc; --card:#ffffff; --text-main:#0f172a; --text-light:#64748b; --border:#e2e8f0; }
            body.dark-mode { --bg:#0b1329 !important; --card:#131c38 !important; --text-main:#f8fafc !important; --text-light:#94a3b8 !important; --border:#1e293b !important; background-color:var(--bg) !important; color:var(--text-main) !important; }
            body.dark-mode .site-header { background:#070d1f !important; border-bottom:1px solid #1e293b !important; }
            body.dark-mode .card, body.dark-mode .portal-card, body.dark-mode .toolbar, body.dark-mode .dash-card, body.dark-mode .panel { background:#131c38 !important; border-color:#1e293b !important; color:#f8fafc !important; }
            body.dark-mode table thead th { background:#1e293b !important; color:#cbd5e1 !important; }
            body.dark-mode tbody td { border-bottom-color:#1e293b !important; color:#f8fafc !important; }
            body.dark-mode tbody tr:hover { background:#1a2544 !important; }
            body.dark-mode footer { background:#070d1f !important; border-top-color:#1e293b !important; color:#94a3b8 !important; }
            .site-header { background:var(--secondary) !important; color:#fff !important; padding:14px 28px !important; display:flex !important; justify-content:space-between !important; align-items:center !important; box-shadow:0 4px 12px rgba(0,0,0,0.1) !important; position:sticky !important; top:0 !important; z-index:1000 !important; width:100% !important; }
            .site-brand { display:flex !important; align-items:center !important; gap:14px !important; text-decoration:none !important; color:#fff !important; }
            .brand-logo-box { width:42px !important; height:42px !important; background:linear-gradient(135deg,#3b82f6,#2563eb) !important; border-radius:10px !important; display:flex !important; align-items:center !important; justify-content:center !important; font-size:18px !important; color:#fff !important; overflow:hidden !important; flex-shrink:0 !important; }
            .brand-logo-box img { width:100% !important; height:100% !important; object-fit:contain !important; background:#fff; }
            .brand-info h1 { font-size:14.5px !important; font-weight:800 !important; margin:0 !important; color:#fff !important; line-height:1.2 !important; }
            .brand-info span { font-size:9.5px !important; color:#93c5fd !important; text-transform:uppercase !important; letter-spacing:0.8px !important; font-weight:700 !important; margin-top:2px !important; display:block !important; }
            .search-global-box { position:relative !important; flex:1 !important; max-width:320px !important; margin:0 16px !important; }
            .search-global-box input { width:100% !important; background:rgba(255,255,255,0.1) !important; border:1px solid rgba(255,255,255,0.2) !important; border-radius:8px !important; padding:7px 12px 7px 34px !important; color:#fff !important; font-size:12.5px !important; outline:none !important; }
            .search-global-box input::placeholder { color:#cbd5e1 !important; }
            .search-global-box i { position:absolute !important; left:12px !important; top:50% !important; transform:translateY(-50%) !important; color:#93c5fd !important; font-size:12px !important; }
            .search-results-dropdown { position:absolute !important; top:calc(100% + 8px) !important; left:0 !important; width:100% !important; background:#ffffff !important; border-radius:10px !important; box-shadow:0 10px 25px rgba(15,23,42,0.15) !important; display:none !important; z-index:3000 !important; overflow:hidden !important; border:1px solid var(--border) !important; }
            .search-dropdown-header { padding:10px 14px !important; font-size:10px !important; font-weight:800 !important; text-transform:uppercase !important; color:var(--text-light) !important; background:#f8fafc !important; border-bottom:1px solid var(--border) !important; }
            .search-item { padding:10px 14px !important; font-size:13px !important; color:var(--text-main) !important; text-decoration:none !important; display:flex !important; align-items:center !important; gap:10px !important; border-bottom:1px solid var(--border) !important; font-weight:500 !important; }
            .search-item:hover { background:#eff6ff !important; color:var(--primary) !important; }
            .search-item i { width:18px !important; color:var(--primary) !important; font-size:13px !important; text-align:center !important; }
            .site-nav-right { display:flex !important; align-items:center !important; gap:10px !important; }
            .btn-topo-acao { background:rgba(255,255,255,0.1) !important; color:#fff !important; border:1px solid rgba(255,255,255,0.2) !important; padding:6px 10px !important; border-radius:8px !important; font-size:11.5px !important; font-weight:700 !important; cursor:pointer !important; text-decoration:none !important; display:inline-flex !important; align-items:center !important; gap:5px !important; }
            .btn-topo-acao:hover { background:rgba(255,255,255,0.2) !important; }
            .empresa-selector { display:flex !important; align-items:center !important; gap:6px !important; background:rgba(255,255,255,0.1) !important; border:1px solid rgba(255,255,255,0.2) !important; border-radius:8px !important; padding:4px 8px !important; }
            .empresa-selector select { border:none !important; background:transparent !important; font-size:11.5px !important; font-weight:600 !important; color:#fff !important; cursor:pointer !important; outline:none !important; max-width:180px; }
            .empresa-selector select option { color:#000 !important; background:#fff !important; }
            .user-box { display:flex !important; align-items:center !important; gap:6px !important; font-size:12px !important; font-weight:600 !important; color:#fff !important; background:rgba(255,255,255,0.08) !important; padding:4px 8px !important; border-radius:8px !important; border:1px solid rgba(255,255,255,0.15) !important; }
            .btn-chave-senha { background:transparent !important; border:none !important; color:#93c5fd !important; cursor:pointer !important; font-size:13px !important; padding:2px 4px !important; display:inline-flex !important; align-items:center !important; }
            .btn-modo-tema { background:rgba(255,255,255,0.12) !important; border:1px solid rgba(255,255,255,0.25) !important; color:#ffd700 !important; width:34px !important; height:34px !important; border-radius:50% !important; cursor:pointer !important; display:flex !important; align-items:center !important; justify-content:center !important; font-size:14px !important; }
            .btn-sair { background:#dc2626 !important; color:#fff !important; border:none !important; padding:6px 10px !important; border-radius:8px !important; font-size:11.5px !important; font-weight:700 !important; cursor:pointer !important; display:inline-flex !important; align-items:center !important; gap:5px !important; }
            .btn-sair:hover { background:#b91c1c !important; }
            .date-time-core { font-size:11.5px !important; font-weight:700 !important; color:#93c5fd !important; white-space:nowrap; }
        `;
        document.head.appendChild(style);
    }

    var rotasModulos = [
        { nome:"Portal Principal (Início)", url:"index.html", icon:"fa-home", keywords:["inicio","portal","home","principal"] },
        { nome:"Módulo Financeiro", url:"modulo_financeiro.html", icon:"fa-wallet", keywords:["financeiro","modulo"] },
        { nome:"Contas a Pagar", url:"contas_pagar.html", icon:"fa-file-invoice-dollar", keywords:["pagar","despesa","fornecedor"] },
        { nome:"Contas a Receber", url:"contas_receber.html", icon:"fa-hand-holding-usd", keywords:["receber","receita","cliente"] },
        { nome:"Faturas & Emissão", url:"faturas.html", icon:"fa-file-invoice", keywords:["fatura","nota","fiscal","nfe"] },
        { nome:"Orçamentos & Propostas", url:"orcamentos.html", icon:"fa-file-contract", keywords:["orcamento","proposta","comercial"] },
        { nome:"Contas Bancárias / Caixa", url:"contas_bancarias.html", icon:"fa-university", keywords:["banco","caixa","saldo"] },
        { nome:"Fluxo de Caixa", url:"fluxo_de_caixa.html", icon:"fa-chart-line", keywords:["fluxo","caixa","entrada","saida"] },
        { nome:"DRE Gerencial", url:"dre_gerencial.html", icon:"fa-chart-pie", keywords:["dre","resultado","contabil"] },
        { nome:"Parceiros & Clientes", url:"parceiros.html", icon:"fa-address-book", keywords:["parceiro","cliente","cnpj"] },
        { nome:"Centros de Custo", url:"centros_custo.html", icon:"fa-sitemap", keywords:["centro","custo","projeto"] },
        { nome:"Trilha de Auditoria", url:"auditoria_sistema.html", icon:"fa-history", keywords:["auditoria","logs","seguranca"] },
        { nome:"Dashboard Analítico", url:"dashboard.html", icon:"fa-chart-bar", keywords:["dashboard","grafico","executivo"] },
        { nome:"Projetos de P&D", url:"projetos_pd.html", icon:"fa-flask", keywords:["projeto","pd","pesquisa","inovacao"] },
        { nome:"Contratos & Aportes (Fomento)", url:"contratos_fomento.html", icon:"fa-file-signature", keywords:["contrato","fomento","aporte","finep"] },
        { nome:"Aportes Recebidos", url:"aportes_pd.html", icon:"fa-money-bill-wave", keywords:["aporte","recebido","subvencao"] },
        { nome:"Gastos de P&D", url:"custos_pd.html", icon:"fa-receipt", keywords:["gasto","custo","despesa","pd"] },
        { nome:"Painel de Saldos P&D", url:"painel_saldos.html", icon:"fa-chart-pie", keywords:["saldo","painel","pd"] },
        { nome:"Ativos & Equipamentos", url:"ativos_equipamentos.html", icon:"fa-boxes", keywords:["ativo","equipamento","patrimonio"] },
        { nome:"Ativos & Equipamentos de P&D", url:"ativos_pd.html", icon:"fa-microscope", keywords:["ativo","equipamento","pd","laboratorio","pesquisa"] },
        { nome:"Sócios & Acionistas", url:"socios.html", icon:"fa-users", keywords:["socio","acionista","participacao"] },
        { nome:"Documentos Recebidos", url:"documentos_recebidos.html", icon:"fa-file-invoice", keywords:["xml","nfe","cte","recebido"] },
        { nome:"Contabilidade (ECD/ECF)", url:"modulo_contabil.html", icon:"fa-book", keywords:["contabilidade","ecd","ecf","balanco"] },
        { nome:"Fiscal (EFD/DCTF)", url:"fiscal_contabil.html", icon:"fa-calculator", keywords:["fiscal","efd","dctf","imposto"] },
        { nome:"Folha / RH (eSocial)", url:"folha_rh.html", icon:"fa-users", keywords:["folha","rh","esocial","salario"] },
        { nome:"Gestão do Escritório", url:"gestao_escritorio.html", icon:"fa-briefcase", keywords:["escritorio","tarefas","clientes"] },
        { nome:"Jurídico & Auditoria", url:"juridico_auditoria.html", icon:"fa-gavel", keywords:["juridico","contrato","auditoria","risco"] },
        { nome:"Dados da Empresa", url:"dados_empresa.html", icon:"fa-building", keywords:["empresa","cnpj","receita","dados"] },
        { nome:"White-Label (Master)", url:"configuracoes_sistema.html", icon:"fa-cog", keywords:["white","label","marca","logo","configuracao"] },
        { nome:"Gestão de Clientes (Master)", url:"clientes_contratantes.html", icon:"fa-building", keywords:["cliente","licenca","plano","master"] },
        { nome:"Usuários & Permissões", url:"usuarios.html", icon:"fa-user-shield", keywords:["usuario","permissao","senha"] },
        { nome:"Calendário Fiscal", url:"calendario_fiscal.html", icon:"fa-calendar-alt", keywords:["calendario","obrigacao","prazo","fiscal","vencimento"] },
        { nome:"Canal com a Contabilidade", url:"canal_contabil.html", icon:"fa-comments", keywords:["canal","chat","mensagem","conversa","contador","contabilidade","solicitacao","duvida"] },
        { nome:"Documentos Contábeis", url:"documentos_contabeis.html", icon:"fa-folder-open", keywords:["documentos","contabeis","contabilidade","enviar","extrato","notas","troca"] },
        { nome:"Registro de Acessos (Contabilidade)", url:"acessos_contabilidade.html", icon:"fa-user-shield", keywords:["acessos","lgpd","contabilidade","quem acessou","registro","auditoria"] },
        { nome:"Transferências", url:"transferencias.html", icon:"fa-exchange-alt", keywords:["transferencia","movimentacao","ted"] },
        { nome:"Extrato Bancário", url:"extrato_bancario.html", icon:"fa-file-invoice", keywords:["extrato","banco","movimento"] },
        { nome:"Conciliação OFX", url:"conciliacao.html", icon:"fa-check-double", keywords:["conciliacao","ofx","extrato"] },
        { nome:"Fechamento de Caixa", url:"fechamento_caixa.html", icon:"fa-cash-register", keywords:["fechamento","caixa","diario"] },
        { nome:"Conciliação Cartões & PIX", url:"conciliacao_cartoes.html", icon:"fa-credit-card", keywords:["cartao","pix","gateway","mdr"] },
        { nome:"Relatórios & BI", url:"relatorios.html", icon:"fa-chart-bar", keywords:["relatorio","bi","indicador"] },
        { nome:"Backup de Dados", url:"backup.html", icon:"fa-database", keywords:["backup","dados","exportar"] },
        { nome:"Produtos & Serviços", url:"produtos.html", icon:"fa-boxes", keywords:["produto","insumo","servico","estoque"] },
        { nome:"Faturamento NFS-e (P&D)", url:"faturamento_pd.html", icon:"fa-file-invoice", keywords:["nfse","servico","faturamento"] },
        { nome:"Certificados Digitais", url:"certificados_digitais.html", icon:"fa-id-card-alt", keywords:["certificado","digital","a1","a3","ecnpj","ecpf","validade","vencimento","token"] },
        { nome:"Assinatura Digital de Documentos", url:"assinar_documento.html", icon:"fa-file-signature", keywords:["assinar","assinatura","digital","certificado","pdf","p7s","pfx","documento"] }
    ];

    function nomeModuloAtual() {
        var arq = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        for (var i = 0; i < rotasModulos.length; i++) {
            if (rotasModulos[i].url === arq) return rotasModulos[i].nome.toUpperCase();
        }
        return "PORTAL DE GESTÃO EMPRESARIAL";
    }

    function getSb() {
        if (window.sb) return window.sb;
        try {
            if (!window.sb && window.supabase) {
                window.sb = window.supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei');
            }
        } catch(e) {}
        return window.sb || null;
    }

    function usuario() { try { return JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); } catch (e) { return null; } }

    function ehMasterCore() {
        var u = usuario();
        return !!(u && u.email && u.email.toLowerCase().trim() === 'lucianojorgesacramento@gmail.com');
    }

    /* ===== BLINDAGEM MULTI-TENANT DE SEGURANÇA (LGPD) ===== */
    window.clienteIdAtual = function() {
        var u = usuario();
        if (!u) return 1;
        if (!ehMasterCore()) {
            return u.cliente_id ? parseInt(u.cliente_id) : 1;
        }
        try {
            var sel = localStorage.getItem('empresaSelecionada');
            if (sel) return parseInt(sel);
        } catch(e) {}
        return u.cliente_id ? parseInt(u.cliente_id) : 1;
    };

    window.sbFiltroSeguro = function(tabela) {
        var sb = getSb();
        if (!sb) return null;
        var cid = window.clienteIdAtual();
        var tabelasGlobais = ['clientes_contratantes', 'usuarios', 'usuarios_empresa', 'cliente_modulos', 'configuracoes_sistema', 'logs'];
        var q = sb.from(tabela).select('*');
        if (tabelasGlobais.indexOf(tabela) === -1 && cid) {
            q = q.eq('cliente_id', cid);
        }
        return q;
    };


    /* ===== PERFIL CONTABILIDADE (v6.4) =====
       A contabilidade (ex.: SCEII) escolhe um cliente vinculado no seletor do topo.
       O sistema "troca o crachá": cliente_id passa a ser o da empresa escolhida e a
       empresa de origem fica guardada em contadorCtx. O BANCO só permite LEITURA
       das empresas vinculadas; esta camada apenas avisa e evita tentativas de gravar. */
    var arquivoAtualCore = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var PAGINAS_LIVRES_CONSULTA = ['documentos_contabeis.html', 'acessos_contabilidade.html', 'canal_contabil.html'];

    function escC(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function ctxContador() {
        var c = null;
        try { c = JSON.parse(localStorage.getItem('contadorCtx') || 'null'); } catch (e) {}
        var u = usuario();
        if (c && (!u || !u.email || String(c.email || '').toLowerCase() !== String(u.email).toLowerCase())) return null; // sobra de outro usuário
        return c;
    }
    function salvarCtx(c) { try { if (c) localStorage.setItem('contadorCtx', JSON.stringify(c)); else localStorage.removeItem('contadorCtx'); } catch (e) {} }
    function emConsulta() {
        if (ehMasterCore()) return false;
        var c = ctxContador(), u = usuario();
        return !!(c && u && c.origemId && parseInt(u.cliente_id) !== parseInt(c.origemId));
    }
    window.erpEmConsulta = emConsulta;
    window.erpContadorCtx = ctxContador;

    function definirEmpresaAtiva(id, origemId) {
        var u = usuario(); if (!u) return;
        u.cliente_id = id;
        if (origemId && parseInt(id) !== parseInt(origemId)) u.cliente_id_origem = origemId; else delete u.cliente_id_origem;
        try {
            localStorage.setItem('usuarioLogado', JSON.stringify(u));
            localStorage.setItem('empresaSelecionada', String(id));
        } catch (e) {}
    }

    function avisoCore(msg) {
        var d = document.getElementById('avisoConsultaCore');
        if (!d) {
            d = document.createElement('div'); d.id = 'avisoConsultaCore'; d.className = 'no-print';
            d.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#78350f;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:2000000;box-shadow:0 8px 24px rgba(0,0,0,.3);max-width:90%;text-align:center;';
            document.body.appendChild(d);
        }
        d.innerText = msg; d.style.display = 'block';
        clearTimeout(d.__t); d.__t = setTimeout(function () { d.style.display = 'none'; }, 4200);
    }

    function registrarAcesso(empresaId, acao) {
        var sb = getSb(), c = ctxContador();
        if (!sb || !c || parseInt(empresaId) === parseInt(c.origemId)) return Promise.resolve();
        var u = usuario();
        var p = sb.auth.getUser().then(function (r) {
            var uid = (r && r.data && r.data.user) ? r.data.user.id : null;
            return sb.from('acessos_contabilidade').insert([{
                contador_cliente_id: parseInt(c.origemId), empresa_cliente_id: parseInt(empresaId),
                user_id: uid, usuario: (u && u.email) || null, acao: acao, pagina: arquivoAtualCore
            }]);
        }).catch(function () {});
        return Promise.race([p, new Promise(function (ok) { setTimeout(ok, 2500); })]);
    }
    function registrarPaginaConsulta() {
        if (!emConsulta()) return;
        var u = usuario(), k = 'acc_' + u.cliente_id + '_' + arquivoAtualCore, ult = 0;
        try { ult = parseInt(sessionStorage.getItem(k) || '0'); } catch (e) {}
        if (Date.now() - ult < 600000) return;
        try { sessionStorage.setItem(k, String(Date.now())); } catch (e) {}
        registrarAcesso(parseInt(u.cliente_id), 'consulta_pagina');
    }

    function mostrarFaixaConsulta() {
        var antiga = document.getElementById('faixaConsultaCore'); if (antiga) antiga.remove();
        if (!emConsulta()) return;
        if (!document.getElementById('faixaConsultaCss')) {
            var st = document.createElement('style'); st.id = 'faixaConsultaCss';
            st.innerHTML = '#faixaConsultaCore{background:#fef3c7;color:#78350f;border-bottom:2px solid #f59e0b;padding:9px 28px;display:flex;justify-content:space-between;align-items:center;gap:14px;font-size:12.5px;line-height:1.4;flex-wrap:wrap;}' +
                '#faixaConsultaCore button{background:#92400e;color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:700;cursor:pointer;white-space:nowrap;}' +
                '#faixaConsultaCore button:hover{background:#78350f;}';
            document.head.appendChild(st);
        }
        var c = ctxContador(), u = usuario();
        var nomeEmp = (c.nomes && c.nomes[u.cliente_id]) || ('Empresa ' + u.cliente_id);
        var h = '<div id="faixaConsultaCore" class="no-print"><span><i class="fas fa-eye"></i> <b>MODO CONSULTA</b> — você está vendo <b>' + escC(nomeEmp) +
                '</b> como <b>' + escC(c.origemNome || 'Contabilidade') + '</b>. Somente leitura: ver, salvar PDF e imprimir. Os acessos ficam registrados.</span>' +
                '<button type="button" onclick="voltarMinhaEmpresaCore()"><i class="fas fa-undo"></i> Voltar para minha empresa</button></div>';
        var header = document.querySelector('.site-header');
        if (header) header.insertAdjacentHTML('afterend', h); else document.body.insertAdjacentHTML('afterbegin', h);
    }

    function montarSeletorContador(c, u) {
        var cont = document.getElementById('seletorEmpresaCoreContainer');
        var sel = document.getElementById('selectEmpresaCore');
        if (!cont || !sel || !c) return;
        sel.innerHTML = '';
        var o0 = document.createElement('option');
        o0.value = c.origemId; o0.textContent = (c.nomes && c.nomes[c.origemId] || 'Minha empresa') + ' (minha empresa)';
        sel.appendChild(o0);
        (c.vinculadas || []).forEach(function (v) {
            var o = document.createElement('option');
            o.value = v.id; o.textContent = (c.nomes && c.nomes[v.id]) || ('Empresa ' + v.id);
            sel.appendChild(o);
        });
        sel.value = String(u.cliente_id);
        cont.style.setProperty('display', 'flex', 'important');
        cont.style.setProperty('visibility', 'visible', 'important');
    }

    function instalarGuardaConsulta() {
        if (window.__guardaConsulta || !emConsulta() || PAGINAS_LIVRES_CONSULTA.indexOf(arquivoAtualCore) > -1) return;
        window.__guardaConsulta = true;
        var VERBOS = /(salvar|gravar|excluir|remover|apagar|deletar|cadastrar|incluir|adicionar|\bnov[oa]\b|editar|alterar|importar|lan[cç]ar|emitir|aprovar|reprovar|liquidar|quitar|estornar|conciliar|transmitir|criar|duplicar|restaurar|confirmar|registrar|registar)/i;
        var LIVRES = /(imprimir|print|pdf|csv|excel|exportar|filtrar|buscar|pesquisar|voltar|fechar|cancelar|limpar|aplicar|visualizar|detalhe|consultar)/i;
        var MSG = 'Modo consulta: a contabilidade só visualiza, salva PDF e imprime. Para lançar ou alterar, volte para a sua empresa.';
        document.addEventListener('click', function (e) {
            if (!emConsulta()) return;
            var el = e.target && e.target.closest ? e.target.closest('button, a, input[type="submit"], input[type="button"], [onclick]') : null;
            if (!el || el.closest('#faixaConsultaCore, .site-header, .search-global-box, #modalAlterarSenhaCore')) return;
            var visivel = (el.innerText || el.value || '').trim();
            if (LIVRES.test(visivel)) return;
            var texto = visivel + ' ' + (el.getAttribute('onclick') || '') + ' ' + (el.getAttribute('title') || '');
            if (VERBOS.test(texto)) { e.preventDefault(); e.stopImmediatePropagation(); avisoCore(MSG); }
        }, true);
        document.addEventListener('submit', function (e) {
            if (!emConsulta()) return;
            if (e.target && e.target.closest && e.target.closest('#faixaConsultaCore, #modalAlterarSenhaCore')) return;
            e.preventDefault(); e.stopImmediatePropagation(); avisoCore(MSG);
        }, true);
    }

    function iniciarContextoContador() {
        var u = usuario(); if (!u || ehMasterCore()) return;
        var c = ctxContador();
        var origem = c && c.origemId ? parseInt(c.origemId) : parseInt(u.cliente_id);
        if (!origem) return;
        if (c) { montarSeletorContador(c, u); mostrarFaixaConsulta(); instalarGuardaConsulta(); registrarPaginaConsulta(); }
        var ts = 0; try { ts = parseInt(sessionStorage.getItem('contadorCheckTs') || '0'); } catch (e) {}
        if (!c && ts && (Date.now() - ts) < 300000) return; // verificou há pouco: não é contabilidade
        var sb = getSb(); if (!sb) return;
        sb.from('vinculos_contador')
          .select('empresa_cliente_id, status, pode_visualizar, pode_trocar_documentos, pode_emitir_nf, pode_usar_certificado')
          .eq('contador_cliente_id', origem)
          .then(function (res) {
              try { sessionStorage.setItem('contadorCheckTs', String(Date.now())); } catch (e) {}
              var lista = ((res && res.data) || []).filter(function (v) { return String(v.status || '').toLowerCase() === 'ativo' && v.pode_visualizar; });
              var atual = usuario();
              if (!lista.length) {
                  if (c) {
                      salvarCtx(null);
                      if (parseInt(atual.cliente_id) !== origem) { definirEmpresaAtiva(origem, origem); location.reload(); }
                  }
                  return;
              }
              var ids = lista.map(function (v) { return parseInt(v.empresa_cliente_id); });
              if (parseInt(atual.cliente_id) !== origem && ids.indexOf(parseInt(atual.cliente_id)) === -1) { definirEmpresaAtiva(origem, origem); location.reload(); return; }
              return sb.from('clientes_contratantes').select('id, razao_social, nome_fantasia').in('id', ids.concat([origem]))
                .then(function (r2) {
                    var nomes = {};
                    ((r2 && r2.data) || []).forEach(function (e) { nomes[e.id] = e.nome_fantasia || e.razao_social || ('Empresa ' + e.id); });
                    var novo = {
                        email: atual.email, origemId: origem, origemNome: nomes[origem] || 'Contabilidade', nomes: nomes,
                        vinculadas: lista.map(function (v) { return { id: parseInt(v.empresa_cliente_id), docs: !!v.pode_trocar_documentos, nf: !!v.pode_emitir_nf, cert: !!v.pode_usar_certificado }; })
                    };
                    salvarCtx(novo);
                    montarSeletorContador(novo, atual); mostrarFaixaConsulta(); instalarGuardaConsulta(); registrarPaginaConsulta();
                });
          }).catch(function () {});
    }

    function iniciarRelogio() {
        if (window.__relogioCoreAtivo) return;
        window.__relogioCoreAtivo = true;
        function tick() {
            var el = document.getElementById('dateTimeCore');
            if (el) el.innerText = new Date().toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' });
        }
        setInterval(tick, 1000);
        setTimeout(tick, 100);
    }

    function limparAntigos() {
        var headers = document.querySelectorAll('header, .site-header');
        for (var i = 0; i < headers.length; i++) {
            var el = headers[i];
            if (!el.parentNode) continue;
            if (el.querySelector('#brandTitleCore')) continue;
            el.parentNode.removeChild(el);
        }
    }

    var tentativasWL = 0;
    function aplicarWhiteLabel() {
        tentativasWL++;
        if (!document.getElementById('brandTitleCore')) { if (tentativasWL < 30) setTimeout(aplicarWhiteLabel, 400); return; }
        var cid = window.clienteIdAtual();
        var sb = getSb();
        if (!sb) { if (tentativasWL < 30) setTimeout(aplicarWhiteLabel, 400); return; }
        sb.from('configuracoes_sistema').select('app_name, app_logo_url').eq('cliente_id', cid).limit(1)
          .then(function (res) {
              if (res && res.data && res.data.length > 0 && (res.data[0].app_name || res.data[0].app_logo_url)) {
                  var cfg = res.data[0];
                  var t = document.getElementById('brandTitleCore');
                  if (t && cfg.app_name) t.innerText = cfg.app_name;
                  var box = document.getElementById('brandLogoBoxCore');
                  if (box && cfg.app_logo_url) box.innerHTML = '<img src="' + cfg.app_logo_url + '" alt="Logo">';
              } else if (tentativasWL < 30) { setTimeout(aplicarWhiteLabel, 400); }
          })
          .catch(function () { if (tentativasWL < 30) setTimeout(aplicarWhiteLabel, 400); });
    }

    var filtroLimpo = false;
    function limparFiltroEmail(forcar) {
        if (filtroLimpo && !forcar) return;
        var u = usuario();
        if (!u || !u.email) return;
        var email = String(u.email).toLowerCase().trim();
        var campos = document.querySelectorAll('input[type="text"], input[type="search"], input:not([type])');
        var limpou = false;
        for (var i = 0; i < campos.length; i++) {
            var inp = campos[i];
            if (inp.id === 'inputBuscaGlobalCore' || inp.id === 'inputBuscaGlobal') continue;
            var val = (inp.value || '').toLowerCase().trim();
            if (val && val.indexOf(email) > -1) {
                inp.value = '';
                inp.dispatchEvent(new Event('input', { bubbles: true }));
                inp.dispatchEvent(new Event('change', { bubbles: true }));
                inp.dispatchEvent(new Event('keyup', { bubbles: true }));
                limpou = true;
            }
        }
        if (limpou) filtroLimpo = true;
    }

    window.addEventListener('DOMContentLoaded', function() {
        try { if (localStorage.getItem('erp_tema_noite') === 'true') document.body.classList.add('dark-mode'); } catch(e) {}
        
        limparAntigos();

        var mod = nomeModuloAtual();
        var arq = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        var btnModulo = '';
        if (arq !== 'index.html') btnModulo = '<a href="index.html" class="btn-topo-acao"><i class="fas fa-home"></i> Início</a>';
        var financeiros = ['contas_pagar','contas_receber','contas_bancarias','fluxo','dre','faturas','orcamentos','transferencias','extrato','conciliacao','fechamento'];
        for (var f = 0; f < financeiros.length; f++) {
            if (arq.indexOf(financeiros[f]) > -1) { btnModulo += '<a href="modulo_financeiro.html" class="btn-topo-acao"><i class="fas fa-wallet"></i> Módulo Financeiro</a>'; break; }
        }
        var isDark = document.body.classList.contains('dark-mode');
        var iconeTema = isDark ? '<i class="fas fa-sun" style="color:#f59e0b;"></i>' : '<i class="fas fa-moon" style="color:#ffd700;"></i>';

        if (!document.getElementById('brandTitleCore')) {
            var headerHtml = '<header class="site-header">' +
                '<a href="index.html" class="site-brand">' +
                    '<div class="brand-logo-box" id="brandLogoBoxCore"><i class="fas fa-cube"></i></div>' +
                    '<div class="brand-info"><h1 id="brandTitleCore">Sacramento ERP</h1><span id="brandSubtitleCore">' + mod + '</span></div>' +
                '</a>' +
                '<div class="search-global-box"><i class="fas fa-search"></i>' +
                    '<input type="text" id="inputBuscaGlobalCore" placeholder="Pesquisar módulo..." autocomplete="off">' +
                    '<div class="search-results-dropdown" id="dropdownResultadosCore"></div>' +
                '</div>' +
                '<div class="site-nav-right">' +
                    '<span class="date-time-core" id="dateTimeCore">--/--/---- --:--</span>' +
                    '<button class="btn-modo-tema" id="btnModoTemaCore" onclick="alternarTemaNoite()" title="Modo Dia / Noite">' + iconeTema + '</button>' +
                    btnModulo +
                    '<div class="empresa-selector" id="seletorEmpresaCoreContainer"><i class="fas fa-building" style="color:#93c5fd;"></i><select id="selectEmpresaCore" onchange="trocarEmpresaCore()"></select></div>' +
                    '<div class="user-box"><i class="fas fa-user-circle" style="font-size:15px;color:#93c5fd;"></i><span id="userNameCore">Usuário</span>' +
                    '<button class="btn-chave-senha" onclick="abrirModalSenhaCore()" title="Alterar Senha"><i class="fas fa-key"></i></button></div>' +
                    '<button class="btn-sair" onclick="sairSistemaCore()"><i class="fas fa-sign-out-alt"></i> Sair</button>' +
                '</div></header>';
            document.body.insertAdjacentHTML('afterbegin', headerHtml);
        }

        var u = usuario();
        var ehMaster = ehMasterCore();
        if (!ehMaster) {
            var selEmp = document.getElementById('seletorEmpresaCoreContainer');
            if (selEmp) selEmp.style.setProperty('display', 'none', 'important');
            iniciarContextoContador();
        } else {
            carregarSeletorEmpresaCore();
        }
        if (u) {
            var el = document.getElementById('userNameCore');
            if (el) el.innerText = (u.nome || u.email || 'Usuário').split(' ')[0];
        }

        if (!document.getElementById('modalAlterarSenhaCore')) {
            var modalHtml = '<div id="modalAlterarSenhaCore" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99999;align-items:center;justify-content:center;">' +
                '<div style="background:#fff;width:100%;max-width:440px;border-radius:14px;box-shadow:0 15px 35px rgba(0,0,0,0.25);overflow:hidden;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid #e2e8f0;">' +
                '<h3 style="font-size:16px;font-weight:800;color:#1e3a8a;margin:0;"><i class="fas fa-key"></i> Alterar Minha Senha</h3>' +
                '<button onclick="fecharModalSenhaCore()" style="background:none;border:none;font-size:16px;color:#64748b;cursor:pointer;"><i class="fas fa-times"></i></button></div>' +
                '<div style="padding:24px;display:flex;flex-direction:column;gap:18px;">' +
                '<div><label style="font-size:10.5px;font-weight:800;color:#64748b;text-transform:uppercase;display:block;margin-bottom:6px;">Nova Senha</label>' +
                '<input type="password" id="novaSenhaInputCore" placeholder="Digite a nova senha" style="width:100%;height:42px;padding:0 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;outline:none;color:#0f172a;"></div>' +
                '<div><label style="font-size:10.5px;font-weight:800;color:#64748b;text-transform:uppercase;display:block;margin-bottom:6px;">Confirmar Nova Senha</label>' +
                '<input type="password" id="confirmaSenhaInputCore" placeholder="Confirme a nova senha" style="width:100%;height:42px;padding:0 14px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;outline:none;color:#0f172a;"></div>' +
                '<button onclick="salvarNovaSenhaCore()" style="background:#2563eb;color:#fff;border:none;height:44px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;"><i class="fas fa-lock"></i> Atualizar Senha</button>' +
                '</div></div></div>';
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        var rodadas = 0;
        var timerLimpeza = setInterval(function () { limparAntigos(); rodadas++; if (rodadas > 30) clearInterval(timerLimpeza); }, 300);
        aplicarWhiteLabel();
        iniciarRelogio();

        var tentFiltro = 0;
        var timerFiltro = setInterval(function () {
            limparFiltroEmail(false);
            tentFiltro++;
            if (tentFiltro > 60) clearInterval(timerFiltro);
        }, 500);

        var inputBusca = document.getElementById('inputBuscaGlobalCore');
        var dropdown = document.getElementById('dropdownResultadosCore');
        if (inputBusca && dropdown) {
            inputBusca.addEventListener('input', function(e) {
                var q = e.target.value.toLowerCase().trim();
                if (!q) { dropdown.style.display = 'none'; return; }
                var encontrados = rotasModulos.filter(function(m) {
                    return m.nome.toLowerCase().includes(q) || m.keywords.some(function(k){ return k.includes(q); });
                });
                if (encontrados.length === 0) {
                    dropdown.innerHTML = '<div class="search-dropdown-header">Resultados</div><div class="search-item" style="color:#64748b;">Nenhum módulo encontrado.</div>';
                } else {
                    dropdown.innerHTML = '<div class="search-dropdown-header">Módulos Encontrados</div>' + encontrados.map(function(m) {
                        return '<a href="' + m.url + '" class="search-item"><i class="fas ' + m.icon + '"></i> <span>' + m.nome + '</span></a>';
                    }).join('');
                }
                dropdown.style.display = 'block';
            });
            document.addEventListener('click', function(e) { if (!e.target.closest('.search-global-box')) dropdown.style.display = 'none'; });
        }
    });

    function carregarSeletorEmpresaCore() {
        var select = document.getElementById('selectEmpresaCore');
        var sb = getSb();
        if (!select || !sb) return;
        sb.from('clientes_contratantes').select('id, razao_social, nome_fantasia').order('id')
          .then(function(res) {
              if (!res || !res.data) return;
              select.innerHTML = '';
              res.data.forEach(function(emp) {
                  var opt = document.createElement('option');
                  opt.value = emp.id;
                  opt.textContent = emp.nome_fantasia || emp.razao_social || ('Empresa ' + emp.id);
                  select.appendChild(opt);
              });
              try { var sel = localStorage.getItem('empresaSelecionada'); if (sel) select.value = sel; } catch(e) {}
          }).catch(function(){});
    }

    window.alternarTemaNoite = function() {
        var isDark = document.body.classList.toggle('dark-mode');
        try { localStorage.setItem('erp_tema_noite', isDark); } catch(e) {}
        var btn = document.getElementById('btnModoTemaCore');
        if (btn) btn.innerHTML = isDark ? '<i class="fas fa-sun" style="color:#f59e0b;"></i>' : '<i class="fas fa-moon" style="color:#ffd700;"></i>';
    };
    window.trocarEmpresaCore = function() {
        var select = document.getElementById('selectEmpresaCore');
        if (!select) return;
        var c = ctxContador();
        if (!ehMasterCore() && c) {
            var novo = parseInt(select.value);
            definirEmpresaAtiva(novo, c.origemId);
            registrarAcesso(novo, 'troca_empresa').then(function () { location.reload(); });
            return;
        }
        try { localStorage.setItem('empresaSelecionada', select.value); } catch(e) {}
        location.reload();
    };
    window.voltarMinhaEmpresaCore = function() {
        var c = ctxContador();
        if (!c) return;
        definirEmpresaAtiva(c.origemId, c.origemId);
        location.href = 'index.html';
    };
    window.sairSistemaCore = function() {
        if (confirm('Deseja realmente encerrar a sessão?')) {
            try {
                localStorage.removeItem('usuarioLogado');
                localStorage.removeItem('empresaSelecionada');
                localStorage.removeItem('contadorCtx');
                sessionStorage.removeItem('contadorCheckTs');
            } catch(e) {}
            var cliSair = getSb();
            var irLogin = function () { location.href = 'login.html'; };
            if (cliSair && cliSair.auth) {
                Promise.race([cliSair.auth.signOut(), new Promise(function (ok) { setTimeout(ok, 2000); })]).then(irLogin, irLogin);
            } else { irLogin(); }
        }
    };
    window.abrirModalSenhaCore = function() {
        var m = document.getElementById('modalAlterarSenhaCore');
        if (m) m.style.display = 'flex';
    };
    window.fecharModalSenhaCore = function() {
        var m = document.getElementById('modalAlterarSenhaCore');
        if (m) m.style.display = 'none';
    };
    window.salvarNovaSenhaCore = async function() {
        var nova = document.getElementById('novaSenhaInputCore').value.trim();
        var conf = document.getElementById('confirmaSenhaInputCore').value.trim();
        if (!nova || !conf) { alert('Preencha todos os campos da senha!'); return; }
        if (nova !== conf) { alert('As senhas não coincidem!'); return; }
        var sb = getSb();
        if (!sb) { alert('Sem conexão com o banco.'); return; }
        var r = await sb.auth.updateUser({ password: nova });
        if (r.error) { alert('Erro ao atualizar senha: ' + r.error.message); return; }
        alert('Senha alterada com sucesso!');
        window.fecharModalSenhaCore();
        document.getElementById('novaSenhaInputCore').value = '';
        document.getElementById('confirmaSenhaInputCore').value = '';
    };
})();

/* ===== IMPRESSÃO PROFISSIONAL v6.2 ===== */
(function () {
  'use strict';

  var styleId = 'erp-print-styles-v62';
  if (!document.getElementById(styleId)) {
    var st = document.createElement('style');
    st.id = styleId;
    st.innerHTML = `
      @page { size: A4; margin: 0; }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 10mm 8mm !important;
          background: #fff !important;
          color: #000 !important;
          width: auto !important;
          box-sizing: border-box !important;
          overflow: visible !important;
        }
        .site-header, .site-nav-right, .search-global-box, .empresa-selector,
        .user-box, .btn-sair, .btn-modo-tema, .btn-topo-acao, .btn-acao-topo,
        nav, aside, .sidebar, .no-print,
        #modalAlterarSenhaCore, #modalAlterarSenha { display: none !important; }
        body > footer, .site-footer, footer.footer, footer:not(.print-doc-footer) { display: none !important; }
        .assistant-widget, .assistant-bubble, .assistant-avatar,
        [class*="float"], [class*="Float"], [class*="fab"], [class*="Fab"],
        [class*="chat"], [class*="Chat"], [class*="help"], [class*="Help"],
        [class*="widget"], [class*="Widget"], [class*="bubble"], [class*="Bubble"],
        [class*="assistant"], [class*="Assistant"], [class*="botao-flutuante"],
        [style*="position:fixed"], [style*="position: fixed"] { display: none !important; }
        body.dark-mode { --bg:#fff !important; --card:#fff !important; --text-main:#000 !important; }
        .container, main, .content, .page-content { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
        .print-doc-header {
          display: block !important;
          position: fixed !important;
          top: 0 !important; left: 0 !important; right: 0 !important;
          background: #fff !important;
          border-bottom: 2px solid #1e3a8a;
          padding-bottom: 6mm;
          margin-bottom: 8mm;
          z-index: 10;
        }
        .print-doc-header .pdh-empresa { font-size: 13px; font-weight: 800; color: #1e3a8a; }
        .print-doc-header .pdh-cnpj { font-size: 9px; color: #475569; }
        .print-doc-header .pdh-titulo { font-size: 11px; font-weight: 700; color: #000; margin-top: 3px; text-transform: uppercase; }
        .print-doc-header .pdh-meta { font-size: 8px; color: #64748b; margin-top: 2px; }
        .print-doc-spacer { display: block !important; height: 26mm; }
        table {
          width: 100% !important; min-width: 0 !important; max-width: 100% !important;
          border-collapse: collapse !important; font-size: 9px !important;
          table-layout: fixed !important; word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        table th, table td {
          border: 1px solid #94a3b8 !important; padding: 3px 5px !important;
          color: #000 !important; background: #fff !important;
          word-wrap: break-word !important; overflow-wrap: break-word !important;
          white-space: normal !important; overflow: hidden !important;
        }
        table th { background: #e2e8f0 !important; font-weight: 700 !important; }
        thead { display: table-header-group; }
        tr, tbody tr { page-break-inside: avoid; display: table-row !important; visibility: visible !important; }
        tbody, thead { display: table-row-group !important; visibility: visible !important; }
        .table-responsive, .table-container, .tabela-container { overflow: visible !important; max-height: none !important; max-width: 100% !important; }
        .print-doc-footer { display: block !important; border-top: 1px solid #94a3b8; margin-top: 10px; padding-top: 5px; font-size: 8px; color: #64748b; }
      }
      .print-doc-header, .print-doc-footer, .print-doc-spacer { display: none; }
    `;
    document.head.appendChild(st);
  }

  function montarDocImpresso() {
    if (document.getElementById('printDocHeader')) return;
    var u = null;
    try { u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); } catch (e) {}
    var nomeEmpresa = 'Sacramento ERP';
    try {
      var el = document.getElementById('brandTitleCore') || document.getElementById('brandTitle');
      if (el && el.innerText) nomeEmpresa = el.innerText;
    } catch (e) {}
    var tituloDoc = (document.title || 'Relatório').replace(/\s*[—-]\s*Sacramento ERP.*/i, '').trim();
    var agora = new Date().toLocaleString('pt-BR');
    var usuario = u ? (u.nome || u.email || '') : '';
    var cid = window.clienteIdAtual();
    var extraConsulta = '';
    try {
      var cc = JSON.parse(localStorage.getItem('contadorCtx') || 'null');
      if (cc && u && String(cc.email || '').toLowerCase() === String(u.email || '').toLowerCase() && parseInt(u.cliente_id) !== parseInt(cc.origemId)) {
        extraConsulta = ' · Consulta realizada por: ' + (cc.origemNome || 'Contabilidade');
      }
    } catch (e) {}

    var header = document.createElement('div');
    header.className = 'print-doc-header';
    header.id = 'printDocHeader';
    header.innerHTML =
      '<div class="pdh-empresa">' + nomeEmpresa + '</div>' +
      '<div class="pdh-cnpj" id="pdhCnpjLinha">Documento emitido pelo Sacramento ERP</div>' +
      '<div class="pdh-titulo">' + tituloDoc + '</div>' +
      '<div class="pdh-meta">Emitido em: ' + agora + ' · Usuário: ' + usuario + extraConsulta + '</div>';
    if (document.body.firstChild) document.body.insertBefore(header, document.body.firstChild);
    else document.body.appendChild(header);

    var spacer = document.createElement('div');
    spacer.className = 'print-doc-spacer';
    spacer.id = 'printDocSpacer';
    if (header.nextSibling) document.body.insertBefore(spacer, header.nextSibling);
    else document.body.appendChild(spacer);

    var footer = document.createElement('div');
    footer.className = 'print-doc-footer';
    footer.id = 'printDocFooter';
    footer.innerHTML = 'Sacramento ERP · Documento gerado eletronicamente por ' + (usuario || 'usuário do sistema') + ' em ' + agora + ' · Página 1';
    document.body.appendChild(footer);

    var sb = (window.sb || (window.supabase ? window.supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei') : null));
    if (sb) {
      sb.from('clientes_contratantes').select('razao_social, nome_fantasia, cnpj').eq('id', cid).maybeSingle()
        .then(function (res) {
          if (res && res.data) {
            var linha = document.getElementById('pdhCnpjLinha');
            if (linha) {
              var partes = [];
              if (res.data.cnpj) partes.push('CNPJ: ' + res.data.cnpj);
              if (partes.length) linha.innerText = partes.join(' · ');
            }
          }
        }).catch(function(){});
    }
  }

  var wlTent = 0;
  function sincronizarNomeImpressao() {
    wlTent++;
    var el = document.getElementById('brandTitleCore') || document.getElementById('brandTitle');
    var pdh = document.querySelector('.print-doc-header .pdh-empresa');
    if (el && pdh && el.innerText && el.innerText !== 'Sacramento ERP') pdh.innerText = el.innerText;
    if (wlTent < 30) setTimeout(sincronizarNomeImpressao, 500);
  }

  function iniciar() {
    montarDocImpresso();
    sincronizarNomeImpressao();
    setTimeout(montarDocImpresso, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();

// CORREÇÃO GLOBAL DE IMPRESSÃO PARA TODOS OS RELATÓRIOS DO SISTEMA
window.addEventListener('beforeprint', () => {
    const elEmpresaHeader = document.querySelector('.site-brand .brand-info h1') || document.querySelector('header h1');
    const nomeEmpresa = elEmpresaHeader ? elEmpresaHeader.innerText : "Sacramento ERP";

    document.querySelectorAll('.print-corporative-header h2, .print-corporative-header h3').forEach(titulo => {
        if (!titulo.innerText.includes(nomeEmpresa)) {
            titulo.innerText = nomeEmpresa + " — " + titulo.innerText.replace("Sacramento ERP — ", "");
        }
    });

    const agora = new Date();
    const dataHoraFmt = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR');
    document.querySelectorAll('#printDataEmissao, .print-data-emissao').forEach(span => {
        span.innerText = dataHoraFmt;
    });
});


/* ===== APLICATIVO INSTALÁVEL + AJUSTE PARA CELULAR (v6.7) =====
   Tudo fica no arquivo pwa.js; aqui só garantimos que ele seja carregado. */
(function () {
  try {
    if (document.querySelector('script[src*="pwa.js"]') || window.__sacramentoPwaCarregado) return;
    window.__sacramentoPwaCarregado = true;
    var sc = document.createElement('script'); sc.src = '/pwa.js'; sc.defer = true;
    document.head.appendChild(sc);
  } catch (e) {}
})();

/* ==========================================================================
   GUARDA DE SESSÃO REAL (v6.8) — vale para TODAS as páginas que carregam o erp-core.js
   - Confere se existe sessão válida no Supabase Auth (não basta o localStorage)
   - Confere se a sessão pertence ao mesmo e-mail guardado no navegador
   - Conta Master só entra com verificação em duas etapas concluída (aal2)
   - Esconde a página até a verificação terminar, para não mostrar a tela a quem não está logado
   A proteção dos dados continua no banco (RLS); esta guarda impede o acesso à tela.
   ========================================================================== */
(function () {
    if (window.__erpGuardaSessao) return;
    window.__erpGuardaSessao = true;

    var pagina = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (['login.html', 'cadastro.html', 'recuperar.html'].indexOf(pagina) > -1) return;

    var EMAIL_MASTER = 'lucianojorgesacramento@gmail.com';

    function esconder() {
        var st = document.createElement('style');
        st.id = 'erpGuardaOculta';
        st.textContent = 'html{visibility:hidden !important}';
        (document.head || document.documentElement).appendChild(st);
    }
    function liberar() {
        var e = document.getElementById('erpGuardaOculta');
        if (e && e.parentNode) e.parentNode.removeChild(e);
    }
    function expulsar() {
        try { localStorage.removeItem('usuarioLogado'); localStorage.removeItem('empresaSelecionada'); } catch (e) {}
        location.replace('login.html');
    }
    function lerAal(token) {
        try {
            var p = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            while (p.length % 4) p += '=';
            return (JSON.parse(atob(p)) || {}).aal || '';
        } catch (e) { return ''; }
    }

    var u = null;
    try { u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); } catch (e) {}
    if (!u || !u.email) { expulsar(); return; }

    esconder();

    var tentativas = 0;
    function verificar() {
        if (!window.supabase) {
            // biblioteca ainda não carregou: espera até 6 segundos
            if (++tentativas > 60) { liberar(); return; }
            setTimeout(verificar, 100);
            return;
        }
        var cli = window.sb;
        if (!cli) {
            try { cli = window.sb = window.supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei'); } catch (e) { liberar(); return; }
        }
        cli.auth.getSession().then(function (r) {
            var sessao = r && r.data ? r.data.session : null;
            if (!sessao || !sessao.user) { expulsar(); return; }
            var emailSessao = String(sessao.user.email || '').toLowerCase().trim();
            if (emailSessao !== String(u.email || '').toLowerCase().trim()) { expulsar(); return; }
            var ehMaster = emailSessao === EMAIL_MASTER.toLowerCase();
            if (ehMaster && lerAal(sessao.access_token) !== 'aal2') { expulsar(); return; }
            liberar();
            try {
                cli.auth.onAuthStateChange(function (evento) { if (evento === 'SIGNED_OUT') expulsar(); });
            } catch (e) {}
        }).catch(function () { liberar(); });
    }
    verificar();
})();

/* ===== ASSISTENTE DE IA (v6.9) =====
   O chat de ajuda fica no arquivo assistente-ia.js; aqui só garantimos que ele seja carregado. */
(function () {
  try {
    if (document.querySelector('script[src*="assistente-ia.js"]') || window.__assistenteIaCarregado) return;
    var sc = document.createElement('script'); sc.src = '/assistente-ia.js'; sc.defer = true;
    document.head.appendChild(sc);
  } catch (e) {}
})();

/* ===== AVISO DE CERTIFICADO DIGITAL (v7.0) =====
   Mostra no topo de qualquer página um aviso quando há certificado vencido ou que vence em até 30 dias.
   Lê só datas e nomes (tabela certificados_digitais); nunca chaves nem senhas. */
(function () {
  try {
    var pagina = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (['login.html', 'cadastro.html', 'recuperar.html', 'certificados_digitais.html'].indexOf(pagina) > -1) return;
    var tentativas = 0;
    function cidAtual() {
      try {
        var u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
        if (!u || !u.email) return null;
        if (String(u.email).toLowerCase().trim() === 'lucianojorgesacramento@gmail.com') {
          var sel = localStorage.getItem('empresaSelecionada');
          if (sel) return parseInt(sel, 10);
          return u.cliente_id ? parseInt(u.cliente_id, 10) : 1;
        }
        return u.cliente_id ? parseInt(u.cliente_id, 10) : null;
      } catch (e) { return null; }
    }
    function dias(fim) {
      var p = String(fim || '').substring(0, 10).split('-'); if (p.length !== 3) return null;
      var h = new Date();
      return Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - Date.UTC(h.getFullYear(), h.getMonth(), h.getDate())) / 86400000);
    }
    function mostrar(venc, prox, detalhes) {
      if (document.getElementById('avisoCertCore')) return;
      var topo = document.querySelector('.site-nav-right'); if (!topo) return;
      var vermelho = venc.length > 0;
      var texto;
      if (vermelho) texto = venc.length === 1 ? 'Certificado vencido' : venc.length + ' certificados vencidos';
      else if (prox.length === 1) texto = prox[0].d === 0 ? 'Certificado vence hoje' : 'Certificado vence em ' + prox[0].d + (prox[0].d === 1 ? ' dia' : ' dias');
      else texto = prox.length + ' certificados a vencer';
      var a = document.createElement('a');
      a.id = 'avisoCertCore'; a.href = 'certificados_digitais.html'; a.title = detalhes.join('\n');
      a.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap;color:#fff;background:' + (vermelho ? '#dc2626' : '#d97706') + ';';
      a.innerHTML = '<i class="fas fa-id-card-alt"></i> ' + texto;
      var ref = topo.querySelector('.empresa-selector');
      if (ref) topo.insertBefore(a, ref); else topo.insertBefore(a, topo.firstChild);
    }
    function verificar() {
      if (!window.sb && window.supabase && tentativas > 10) { try { window.sb = window.supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei'); } catch (e) {} }
      if (!window.sb || !document.querySelector('.site-nav-right')) { if (++tentativas > 100) return; setTimeout(verificar, 150); return; }
      var cid = cidAtual(); if (!cid) return;
      window.sb.from('certificados_digitais').select('nome_titular,tipo,validade_fim,status').eq('cliente_id', cid).eq('status', 'ativo')
        .then(function (r) {
          if (!r || r.error || !r.data) return;
          var venc = [], prox = [], det = [];
          r.data.forEach(function (c) {
            var d = dias(c.validade_fim); if (d === null) return;
            if (d < 0) { venc.push(c); det.push(c.nome_titular + ' (' + c.tipo + '): vencido há ' + (-d) + ' dia(s)'); }
            else if (d <= 30) { prox.push({ d: d }); det.push(c.nome_titular + ' (' + c.tipo + '): vence em ' + d + ' dia(s)'); }
          });
          if (venc.length || prox.length) mostrar(venc, prox, det);
        }, function () {});
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(verificar, 300); });
    else setTimeout(verificar, 300);
  } catch (e) {}
})();

/* ===== AVISO DE NOVAS MENSAGENS DO CANAL (contabilidade <-> cliente) =====
   Em qualquer tela: consulta a cada 30 s quantas mensagens não lidas existem e,
   se chegou mensagem nova, mostra um aviso flutuante (com som discreto), o contador
   no título da aba e, se o usuário permitiu, uma notificação do navegador/celular. */
(function () {
    var arq = (location.pathname.split('/').pop() || '').toLowerCase();
    if (arq === 'login.html') return;
    var u = null;
    try { u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); } catch (e) {}
    if (!u) return;
    var tituloOriginal = document.title, ultimo = null, timer = null;

    function cliente() {
        if (window.sb) return window.sb;
        try { if (window.supabase) window.sb = window.supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei'); } catch (e) {}
        return window.sb || null;
    }
    function bip() {
        try {
            var A = window.AudioContext || window.webkitAudioContext; if (!A) return;
            var c = new A(), o = c.createOscillator(), g = c.createGain();
            o.type = 'sine'; o.frequency.value = 880; g.gain.value = 0.08;
            o.connect(g); g.connect(c.destination); o.start();
            setTimeout(function () { o.frequency.value = 1175; }, 130);
            setTimeout(function () { o.stop(); c.close(); }, 300);
        } catch (e) {}
    }
    function mostrar(n, novas) {
        var el = document.getElementById('erpAvisoCanal');
        if (!el) {
            el = document.createElement('div'); el.id = 'erpAvisoCanal';
            el.style.cssText = 'position:fixed;right:20px;bottom:90px;z-index:2147483000;background:#1e3a8a;color:#fff;border-radius:14px;padding:14px 18px;box-shadow:0 12px 30px rgba(0,0,0,.35);font-family:Inter,Arial,sans-serif;font-size:14px;max-width:340px;cursor:pointer;display:flex;gap:12px;align-items:center;border-left:5px solid #10b981;';
            el.onclick = function (ev) { if (ev.target && ev.target.id === 'erpAvisoX') { el.style.display = 'none'; return; } location.href = 'canal_contabil.html'; };
            document.body.appendChild(el);
        }
        el.innerHTML = '<i class="fas fa-comments" style="font-size:22px;color:#34d399;"></i><div style="flex:1;"><b>Nova mensagem</b><br><span style="font-size:12.5px;opacity:.9;">' +
            (n === 1 ? 'Você tem 1 mensagem não lida' : 'Você tem ' + n + ' mensagens não lidas') + ' no canal da contabilidade. Clique para abrir.</span></div>' +
            '<span id="erpAvisoX" style="font-size:20px;opacity:.7;padding:0 4px;">×</span>';
        el.style.display = 'flex';
    }
    function notificar(n) {
        try {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;
            var x = new Notification('Nova mensagem no canal', { body: n === 1 ? 'Você tem 1 mensagem não lida.' : 'Você tem ' + n + ' mensagens não lidas.', tag: 'canal-erp' });
            x.onclick = function () { window.focus(); location.href = 'canal_contabil.html'; };
        } catch (e) {}
    }
    function checar() {
        var c = cliente(); if (!c || !c.rpc) return;
        c.rpc('canal_nao_lidas').then(function (r) {
            if (!r || r.error) return;
            var n = Number(r.data) || 0;
            document.title = n > 0 ? '(' + n + ') ' + tituloOriginal : tituloOriginal;
            var guardado = parseInt(sessionStorage.getItem('canalUlt') || '0') || 0;
            var base = ultimo === null ? guardado : ultimo;
            if (n > base && arq !== 'canal_contabil.html') { mostrar(n); bip(); notificar(n); }
            try { sessionStorage.setItem('canalUlt', String(n)); } catch (e2) {}
            if (n === 0) { var e = document.getElementById('erpAvisoCanal'); if (e) e.style.display = 'none'; }
            ultimo = n;
        }).catch(function () {});
    }
    function iniciar() {
        setTimeout(checar, 2500);
        timer = setInterval(function () { if (!document.hidden) checar(); }, 30000);
        document.addEventListener('visibilitychange', function () { if (!document.hidden) checar(); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
    window.erpAtivarAvisosCanal = function () {
        if (!('Notification' in window)) { alert('Este navegador não suporta notificações.'); return; }
        Notification.requestPermission().then(function (p) { if (p === 'granted') { try { new Notification('Avisos ativados', { body: 'Você será avisado quando chegar mensagem nova.' }); } catch (e) {} } });
    };
})();
