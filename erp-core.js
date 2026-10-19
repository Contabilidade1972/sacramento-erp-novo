/* ============================================================
   erp-core.js — Motor Central v5.0 (CORRIGIDO)
   - White-Label lê de configuracoes_sistema (fonte certa)
   - Reusa a conexão única window.sb (nunca cria outra)
   - Relógio próprio (fim da data estática)
   - Lista de módulos completa
   ============================================================ */
(function() {
    'use strict';
    var styleId = 'erp-core-styles-universal-v50';
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

    /* ===== LISTA COMPLETA DE MÓDULOS (busca + subtítulo) ===== */
    var rotasModulos = [
        { nome:"Portal Principal (Início)", url:"index.html", icon:"fa-home", keywords:["inicio","portal","home","principal"] },
        { nome:"Módulo Financeiro", url:"modulo_financeiro.html", icon:"fa-wallet", keywords:["financeiro","modulo"] },
        { nome:"Contas a Pagar", url:"contas_pagar.html", icon:"fa-file-invoice-dollar", keywords:["pagar","despesa","fornecedor"] },
        { nome:"Contas a Receber", url:"contas_receber.html", icon:"fa-hand-holding-usd", keywords:["receber","receita","cliente"] },
        { nome:"Faturas & Emissão", url:"faturas.html", icon:"fa-file-invoice", keywords:["fatura","nota","fiscal","nfe"] },
        { nome:"Orçamentos & Propostas", url:"orcamentos.html", icon:"fa-file-contract", keywords:["orcamento","proposta","comercial"] },
        { nome:"Contas Bancárias / Caixa", url:"contas_bancarias.html", icon:"fa-university", keywords:["banco","caixa","saldo"] },
        { nome:"Fluxo de Caixa", url:"fluxo_de_caixa.html", icon:"fa-chart-line", keywords:["fluxo","caixa","entrada","saida"] },
        { nome:"DRE Gerencial", url:"dre.html", icon:"fa-chart-pie", keywords:["dre","resultado","contabil"] },
        { nome:"Parceiros & Clientes", url:"parceiros.html", icon:"fa-address-book", keywords:["parceiro","cliente","cnpj"] },
        { nome:"Centros de Custo", url:"centros_custo.html", icon:"fa-sitemap", keywords:["centro","custo","projeto"] },
        { nome:"Trilha de Auditoria", url:"auditoria_sistema.html", icon:"fa-history", keywords:["auditoria","logs","seguranca"] },
        { nome:"Dashboard Analítico", url:"dashboard.html", icon:"fa-chart-bar", keywords:["dashboard","grafico","executivo"] },
        { nome:"Projetos de P&D", url:"projetos_pd.html", icon:"fa-flask", keywords:["projeto","pd","pesquisa","inovacao"] },
        { nome:"Contratos & Aportes (Fomento)", url:"contratos_fomento.html", icon:"fa-file-signature", keywords:["contrato","fomento","aporte","finep"] },
        { nome:"Aportes Recebidos", url:"aportes_pd.html", icon:"fa-money-bill-wave", keywords:["aporte","recebido","subvencao"] },
        { nome:"Gastos de P&D", url:"custos_pd.html", icon:"fa-receipt", keywords:["gasto","custo","despesa","pd"] },
        { nome:"Painel de Saldos P&D", url:"painel_saldos.html", icon:"fa-chart-pie", keywords:["saldo","painel","pd"] },
        { nome:"Ativos & Equipamentos", url:"ativos_equipamentos.html", icon:"fa-microscope", keywords:["ativo","equipamento","patrimonio"] },
        { nome:"Sócios & Acionistas", url:"socios.html", icon:"fa-users", keywords:["socio","acionista","participacao"] },
        { nome:"Documentos Recebidos", url:"documentos_recebidos.html", icon:"fa-file-invoice", keywords:["xml","nfe","cte","recebido"] },
        { nome:"Contabilidade (ECD/ECF)", url:"contabilidade.html", icon:"fa-book", keywords:["contabilidade","ecd","ecf","balanco"] },
        { nome:"Fiscal (EFD/DCTF)", url:"fiscal_contabil.html", icon:"fa-calculator", keywords:["fiscal","efd","dctf","imposto"] },
        { nome:"Folha / RH (eSocial)", url:"folha_rh.html", icon:"fa-users", keywords:["folha","rh","esocial","salario"] },
        { nome:"Gestão do Escritório", url:"gestao_escritorio.html", icon:"fa-briefcase", keywords:["escritorio","tarefas","clientes"] },
        { nome:"Jurídico & Auditoria", url:"juridico_auditoria.html", icon:"fa-gavel", keywords:["juridico","contrato","auditoria","risco"] },
        { nome:"Dados da Empresa", url:"dados_empresa.html", icon:"fa-building", keywords:["empresa","cnpj","receita","dados"] },
        { nome:"White-Label (Master)", url:"configuracoes_sistema.html", icon:"fa-cog", keywords:["white","label","marca","logo","configuracao"] },
        { nome:"Gestão de Clientes (Master)", url:"clientes_contratantes.html", icon:"fa-building", keywords:["cliente","licenca","plano","master"] },
        { nome:"Usuários & Permissões", url:"usuarios.html", icon:"fa-user-shield", keywords:["usuario","permissao","senha"] },
        { nome:"Calendário Fiscal", url:"calendario.html", icon:"fa-calendar-alt", keywords:["calendario","obrigacao","prazo"] },
        { nome:"Transferências", url:"transferencias.html", icon:"fa-exchange-alt", keywords:["transferencia","movimentacao","ted"] },
        { nome:"Extrato Bancário", url:"extrato_bancario.html", icon:"fa-file-invoice", keywords:["extrato","banco","movimento"] },
        { nome:"Conciliação OFX", url:"conciliacao.html", icon:"fa-check-double", keywords:["conciliacao","ofx","extrato"] },
        { nome:"Fechamento de Caixa", url:"fechamento_caixa.html", icon:"fa-cash-register", keywords:["fechamento","caixa","diario"] },
        { nome:"Conciliação Cartões & PIX", url:"conciliacao_cartoes.html", icon:"fa-credit-card", keywords:["cartao","pix","gateway","mdr"] },
        { nome:"Relatórios & BI", url:"relatorios.html", icon:"fa-chart-bar", keywords:["relatorio","bi","indicador"] },
        { nome:"Backup de Dados", url:"backup.html", icon:"fa-database", keywords:["backup","dados","exportar"] },
        { nome:"Produtos & Serviços", url:"produtos.html", icon:"fa-boxes", keywords:["produto","insumo","servico","estoque"] },
        { nome:"Faturamento NFS-e (P&D)", url:"nfse_servicos.html", icon:"fa-file-invoice", keywords:["nfse","servico","faturamento"] }
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

    /* ===== RELÓGIO (trava exclusiva — fim da data estática) ===== */
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

    /* ===== WHITE-LABEL: lê de configuracoes_sistema (FONTE CERTA) ===== */
    function aplicarWhiteLabel() {
        var u = null;
        try { u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); } catch(e) {}
        if (!u) return;
        var cid = (u.cliente_id != null) ? u.cliente_id : 1;
        try { var sel = localStorage.getItem('empresaSelecionada'); if (sel) cid = parseInt(sel); } catch(e) {}
        var sb = getSb();
        if (!sb) return;
        sb.from('configuracoes_sistema').select('app_name, app_logo_url').eq('cliente_id', cid).limit(1)
          .then(function(res) {
              if (res && res.data && res.data.length > 0 && (res.data[0].app_name || res.data[0].app_logo_url)) {
                  var cfg = res.data[0];
                  var t = document.getElementById('brandTitleCore');
                  if (t && cfg.app_name) t.innerText = cfg.app_name;
                  var box = document.getElementById('brandLogoBoxCore');
                  if (box && cfg.app_logo_url) box.innerHTML = '<img src="' + cfg.app_logo_url + '" alt="Logo">';
              } else {
                  /* Fallback: nome da empresa em clientes_contratantes */
                  return sb.from('clientes_contratantes').select('nome_fantasia, razao_social, logotipo_url').eq('id', cid).maybeSingle()
                    .then(function(r2) {
                        if (r2 && r2.data) {
                            var nome = r2.data.nome_fantasia || r2.data.razao_social;
                            var t2 = document.getElementById('brandTitleCore');
                            if (t2 && nome) t2.innerText = nome;
                            var box2 = document.getElementById('brandLogoBoxCore');
                            if (box2 && r2.data.logotipo_url) box2.innerHTML = '<img src="' + r2.data.logotipo_url + '" alt="Logo">';
                        }
                    });
              }
          }).catch(function(){});
    }

    window.addEventListener('DOMContentLoaded', function() {
        try { if (localStorage.getItem('erp_tema_noite') === 'true') document.body.classList.add('dark-mode'); } catch(e) {}
        /* Remove APENAS cabeçalhos antigos estáticos (mantém o conteúdo das páginas) */
        var antigos = document.querySelectorAll('header.header, aside.sidebar');
        antigos.forEach(function(h) { h.remove(); });

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

        /* LGPD: seletor só para Master */
        var u = null;
        try { u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); } catch(e) {}
        var ehMaster = u && u.email && u.email.toLowerCase().trim() === 'lucianojorgesacramento@gmail.com';
        if (!ehMaster) {
            var selEmp = document.getElementById('seletorEmpresaCoreContainer');
            if (selEmp) selEmp.style.display = 'none';
        } else {
            carregarSeletorEmpresaCore();
        }
        if (u) {
            var el = document.getElementById('userNameCore');
            if (el) el.innerText = (u.nome || u.email || 'Usuário').split(' ')[0];
        }

        /* MODAL SENHA */
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

        aplicarWhiteLabel();
        iniciarRelogio();

        /* BUSCA GLOBAL (bug da barra invertida corrigido) */
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
        try { localStorage.setItem('empresaSelecionada', select.value); } catch(e) {}
        location.reload();
    };
    window.sairSistemaCore = function() {
        if (confirm('Deseja realmente encerrar a sessão?')) {
            try {
                localStorage.removeItem('usuarioLogado');
                localStorage.removeItem('empresaSelecionada');
            } catch(e) {}
            location.href = 'login.html';
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
