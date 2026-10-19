// erp-core.js — Motor Central de Interface, White-Label e Injeção Universal do Cabeçalho Padrão — Sacramento ERP

(function() {
    const styleId = 'erp-core-styles-universal-v40';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            :root {
                --primary: #2563eb;
                --primary-dark: #1d4ed8;
                --secondary: #1e3a8a;
                --success: #10b981;
                --bg: #f8fafc;
                --card: #ffffff;
                --text-main: #0f172a;
                --text-light: #64748b;
                --border: #e2e8f0;
            }

            /* TEMA ESCURO (NOITE) */
            body.dark-mode {
                --bg: #0b1329 !important;
                --card: #131c38 !important;
                --text-main: #f8fafc !important;
                --text-light: #94a3b8 !important;
                --border: #1e293b !important;
                background-color: var(--bg) !important;
                color: var(--text-main) !important;
            }
            body.dark-mode .site-header { background: #070d1f !important; border-bottom: 1px solid #1e293b !important; }
            body.dark-mode .card, body.dark-mode .portal-card, body.dark-mode .toolbar, body.dark-mode .dash-card, body.dark-mode .panel { background: #131c38 !important; border-color: #1e293b !important; color: #f8fafc !important; }
            body.dark-mode table thead th { background: #1e293b !important; color: #cbd5e1 !important; }
            body.dark-mode tbody td { border-bottom-color: #1e293b !important; color: #f8fafc !important; }
            body.dark-mode tbody tr:hover { background: #1a2544 !important; }
            body.dark-mode footer { background: #070d1f !important; border-top-color: #1e293b !important; color: #94a3b8 !important; }

            /* HEADER CORPORATIVO PADRÃO UNIFICADO */
            .site-header {
                background: var(--secondary) !important; color: #fff !important; padding: 14px 28px !important; display: flex !important; justify-content: space-between !important; align-items: center !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; position: sticky !important; top: 0 !important; z-index: 1000 !important; width: 100% !important;
            }
            .site-brand { display: flex !important; align-items: center !important; gap: 14px !important; text-decoration: none !important; color: #fff !important; }
            .brand-logo-box { width: 42px !important; height: 42px !important; background: linear-gradient(135deg, #3b82f6, #2563eb) !important; border-radius: 10px !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 18px !important; color: #fff !important; box-shadow: 0 2px 8px rgba(37,99,235,0.3) !important; overflow: hidden !important; flex-shrink: 0 !important; }
            .brand-logo-box img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
            .brand-info h1 { font-size: 14.5px !important; font-weight: 800 !important; letter-spacing: -0.3px !important; margin: 0 !important; color: #fff !important; line-height: 1.2 !important; }
            .brand-info span { font-size: 9.5px !important; color: #93c5fd !important; text-transform: uppercase !important; letter-spacing: 0.8px !important; font-weight: 700 !important; margin-top: 2px !important; display: block !important; }

            /* BARRA DE PESQUISA GLOBAL */
            .search-global-box { position: relative !important; flex: 1 !important; max-width: 320px !important; margin: 0 16px !important; }
            .search-global-box input { width: 100% !important; background: rgba(255,255,255,0.1) !important; border: 1px solid rgba(255,255,255,0.2) !important; border-radius: 8px !important; padding: 7px 12px 7px 34px !important; color: #fff !important; font-size: 12.5px !important; outline: none !important; transition: all 0.2s ease !important; }
            .search-global-box input::placeholder { color: #cbd5e1 !important; font-weight: 400 !important; }
            .search-global-box input:focus { background: rgba(255,255,255,0.18) !important; border-color: #93c5fd !important; box-shadow: 0 0 0 3px rgba(147,197,253,0.2) !important; }
            .search-global-box i { position: absolute !important; left: 12px !important; top: 50% !important; transform: translateY(-50%) !important; color: #93c5fd !important; font-size: 12px !important; }
            
            .search-results-dropdown { position: absolute !important; top: calc(100% + 8px) !important; left: 0 !important; width: 100% !important; background: #ffffff !important; border-radius: 10px !important; box-shadow: 0 10px 25px rgba(15,23,42,0.15) !important; display: none !important; z-index: 3000 !important; overflow: hidden !important; border: 1px solid var(--border) !important; }
            .search-dropdown-header { padding: 10px 14px !important; font-size: 10px !important; font-weight: 800 !important; text-transform: uppercase !important; color: var(--text-light) !important; background: #f8fafc !important; border-bottom: 1px solid var(--border) !important; letter-spacing: 0.8px !important; }
            .search-item { padding: 10px 14px !important; font-size: 13px !important; color: var(--text-main) !important; text-decoration: none !important; display: flex !important; align-items: center !important; gap: 10px !important; border-bottom: 1px solid var(--border) !important; transition: 0.15s !important; font-weight: 500 !important; }
            .search-item:last-child { border-bottom: none !important; }
            .search-item:hover { background: #eff6ff !important; color: var(--primary) !important; padding-left: 16px !important; }
            .search-item i { width: 18px !important; color: var(--primary) !important; font-size: 13px !important; text-align: center !important; }

            .site-nav-right { display: flex !important; align-items: center !important; gap: 10px !important; }
            .btn-topo-acao { background: rgba(255,255,255,0.1) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.2) !important; padding: 6px 10px !important; border-radius: 8px !important; font-size: 11.5px !important; font-weight: 700 !important; cursor: pointer !important; text-decoration: none !important; display: inline-flex !important; align-items: center !important; gap: 5px !important; transition: 0.2s !important; }
            .btn-topo-acao:hover { background: rgba(255,255,255,0.2) !important; }

            .empresa-selector { display: flex !important; align-items: center !important; gap: 6px !important; background: rgba(255,255,255,0.1) !important; border: 1px solid rgba(255,255,255,0.2) !important; border-radius: 8px !important; padding: 4px 8px !important; }
            .empresa-selector select { border: none !important; background: transparent !important; font-size: 11.5px !important; font-weight: 600 !important; color: #fff !important; cursor: pointer !important; outline: none !important; }
            .empresa-selector select option { color: #000 !important; background: #fff !important; }
            
            .user-box { display: flex !important; align-items: center !important; gap: 6px !important; font-size: 12px !important; font-weight: 600 !important; color: #fff !important; background: rgba(255,255,255,0.08) !important; padding: 4px 8px !important; border-radius: 8px !important; border: 1px solid rgba(255,255,255,0.15) !important; }
            .btn-chave-senha { background: transparent !important; border: none !important; color: #93c5fd !important; cursor: pointer !important; font-size: 13px !important; padding: 2px 4px !important; transition: 0.2s !important; display: inline-flex !important; align-items: center !important; }
            .btn-chave-senha:hover { color: #fff !important; transform: scale(1.1) !important; }
            
            .btn-modo-tema { background: rgba(255,255,255,0.12) !important; border: 1px solid rgba(255,255,255,0.25) !important; color: #ffd700 !important; width: 34px !important; height: 34px !important; border-radius: 50% !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 14px !important; transition: 0.2s !important; }
            .btn-modo-tema:hover { background: rgba(255,255,255,0.25) !important; transform: scale(1.08) !important; }

            .btn-sair { background: #dc2626 !important; color: #fff !important; border: none !important; padding: 6px 10px !important; border-radius: 8px !important; font-size: 11.5px !important; font-weight: 700 !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; gap: 5px !important; transition: 0.2s !important; }
            .btn-sair:hover { background: #b91c1c !important; }
        `;
        document.head.appendChild(style);
    }

    const rotasModulos = [
        { nome: "Portal Principal (Início)", url: "index.html", icon: "fa-home", keywords: ["inicio", "portal", "home", "principal"] },
        { nome: "Módulo Financeiro", url: "modulo_financeiro.html", icon: "fa-wallet", keywords: ["financeiro", "modulo"] },
        { nome: "Contas a Pagar", url: "contas_pagar.html", icon: "fa-file-invoice-dollar", keywords: ["pagar", "despesa", "fornecedor", "boleto"] },
        { nome: "Contas a Receber", url: "contas_receber.html", icon: "fa-hand-holding-usd", keywords: ["receber", "receita", "cliente", "fatura"] },
        { nome: "Faturas & Emissão", url: "faturas.html", icon: "fa-file-invoice", keywords: ["fatura", "nota", "fiscal", "sefaz", "nfe"] },
        { nome: "Orçamentos & Propostas", url: "orcamentos.html", icon: "fa-file-contract", keywords: ["orcamento", "proposta", "comercial", "venda"] },
        { nome: "Contas Bancárias / Caixa", url: "contas_bancarias.html", icon: "fa-university", keywords: ["banco", "caixa", "saldo", "conta"] },
        { nome: "Fluxo de Caixa", url: "fluxo_de_caixa.html", icon: "fa-chart-line", keywords: ["fluxo", "caixa", "projecao", "entrada", "saida"] },
        { nome: "DRE Gerencial", url: "dre.html", icon: "fa-chart-pie", keywords: ["dre", "resultado", "contabil", "exercicio"] },
        { nome: "Parceiros & Clientes", url: "parceiros.html", icon: "fa-address-book", keywords: ["parceiro", "cliente", "fornecedor", "cnpj", "cadastro"] },
        { nome: "Centros de Custo", url: "centros_custo.html", icon: "fa-sitemap", keywords: ["centro", "custo", "projeto"] },
        { nome: "Trilha de Auditoria", url: "auditoria_sistema.html", icon: "fa-history", keywords: ["auditoria", "logs", "acessos", "seguranca"] },
        { nome: "Dashboard Analítico", url: "dashboard.html", icon: "fa-chart-bar", keywords: ["dashboard", "grafico", "executivo", "relatorio"] }
    ];

    window.addEventListener('DOMContentLoaded', () => {
        if (localStorage.getItem('erp_tema_noite') === 'true') {
            document.body.classList.add('dark-mode');
        }

        // REMOVE QUALQUER CABEÇALHO ESTÁTICO ANTIGO DAS PÁGINAS PARA EVITAR CONFLITO
        const cabecalhosAntigos = document.querySelectorAll('header, .site-header, .header');
        cabecalhosAntigos.forEach(h => h.remove());

        const pathAtual = window.location.pathname.toLowerCase();
        let nomeModulo = "PORTAL DE GESTÃO EMPRESARIAL";
        if (pathAtual.includes("modulo_financeiro")) nomeModulo = "MÓDULO FINANCEIRO";
        else if (pathAtual.includes("contas_pagar")) nomeModulo = "CONTAS A PAGAR";
        else if (pathAtual.includes("contas_receber")) nomeModulo = "CONTAS A RECEBER";
        else if (pathAtual.includes("dre")) nomeModulo = "DRE GERENCIAL";
        else if (pathAtual.includes("fluxo")) nomeModulo = "FLUXO DE CAIXA";
        else if (pathAtual.includes("dashboard")) nomeModulo = "DASHBOARD EXECUTIVO";
        else if (pathAtual.includes("contas_bancarias")) nomeModulo = "CONTAS BANCÁRIAS & CAIXA";
        else if (pathAtual.includes("orcamentos")) nomeModulo = "ORÇAMENTOS & PROPOSTAS";
        else if (pathAtual.includes("faturas")) nomeModulo = "FATURAS & EMISSÃO";
        else if (pathAtual.includes("parceiros")) nomeModulo = "GESTÃO DE PARCEIROS";
        else if (pathAtual.includes("centros_custo")) nomeModulo = "CENTROS DE CUSTO";
        else if (pathAtual.includes("auditoria")) nomeModulo = "TRILHA DE AUDITORIA";

        let botaoModuloHtml = "";
        if (!pathAtual.includes("index.html") && !pathAtual.endsWith("/")) {
            botaoModuloHtml = `<a href="index.html" class="btn-topo-acao"><i class="fas fa-home"></i> Início</a>`;
        }
        if (pathAtual.includes("contas_pagar") || pathAtual.includes("contas_receber") || pathAtual.includes("contas_bancarias") || pathAtual.includes("fluxo") || pathAtual.includes("dre") || pathAtual.includes("faturas") || pathAtual.includes("orcamentos")) {
            botaoModuloHtml += `<a href="modulo_financeiro.html" class="btn-topo-acao"><i class="fas fa-wallet"></i> Módulo Financeiro</a>`;
        }

        const isDark = document.body.classList.contains('dark-mode');
        const iconeTema = isDark ? '<i class="fas fa-sun" style="color:#f59e0b;"></i>' : '<i class="fas fa-moon" style="color:#ffd700;"></i>';

        const headerHtml = `
            <header class="site-header">
                <a href="index.html" class="site-brand">
                    <div class="brand-logo-box" id="brandLogoBoxCore"><i class="fas fa-cube"></i></div>
                    <div class="brand-info">
                        <h1 id="brandTitleCore">Sacramento ERP</h1>
                        <span id="brandSubtitleCore">${nomeModulo}</span>
                    </div>
                </a>

                <div class="search-global-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="inputBuscaGlobalCore" placeholder="Pesquisar módulo, orçamento..." autocomplete="off">
                    <div class="search-results-dropdown" id="dropdownResultadosCore"></div>
                </div>

                <div class="site-nav-right">
                    <button class="btn-modo-tema" id="btnModoTemaCore" onclick="alternarTemaNoite()" title="Alternar Modo Dia / Noite">${iconeTema}</button>
                    ${botaoModuloHtml}
                    <div class="empresa-selector" id="seletorEmpresaCoreContainer">
                        <i class="fas fa-building" style="color: #93c5fd;"></i>
                        <select id="selectEmpresaCore" onchange="trocarEmpresaCore()"></select>
                    </div>
                    <div class="user-box">
                        <i class="fas fa-user-circle" style="font-size: 15px; color: #93c5fd;"></i>
                        <span id="userNameCore">Usuário</span>
                        <button class="btn-chave-senha" onclick="abrirModalSenhaCore()" title="Alterar Senha"><i class="fas fa-key"></i></button>
                    </div>
                    <button class="btn-sair" onclick="sairSistemaCore()"><i class="fas fa-sign-out-alt"></i> Sair</button>
                </div>
            </header>
        `;
        document.body.insertAdjacentHTML('afterbegin', headerHtml);

        // BLINDAGEM LGPD: Oculta o seletor para utilizadores não-master
        const uSessao = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
        const emailM = "lucianojorgesacramento@gmail.com";
        const ehMasterGlobal = uSessao && uSessao.email && uSessao.email.toLowerCase().trim() === emailM.toLowerCase().trim();
        if (!ehMasterGlobal) {
            const selEmp = document.getElementById('seletorEmpresaCoreContainer');
            if (selEmp) selEmp.style.display = 'none';
        }

        // MODAL DE ALTERAÇÃO DE SENHA GLOBAL
        if (!document.getElementById('modalAlterarSenhaCore')) {
            const modalHtml = `
                <div id="modalAlterarSenhaCore" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:99999; align-items:center; justify-content:center;">
                    <div style="background:#fff; width:100%; max-width:440px; border-radius:14px; box-shadow:0 15px 35px rgba(0,0,0,0.25); overflow:hidden;">
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid #e2e8f0;">
                            <h3 style="font-size:16px; font-weight:800; color:#1e3a8a; display:flex; align-items:center; gap:10px;"><i class="fas fa-key"></i> Alterar Minha Senha</h3>
                            <button onclick="fecharModalSenhaCore()" style="background:none; border:none; font-size:16px; color:#64748b; cursor:pointer;"><i class="fas fa-times"></i></button>
                        </div>
                        <div style="padding:24px; display:flex; flex-direction:column; gap:18px;">
                            <div>
                                <label style="font-size:10.5px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px;">Nova Senha</label>
                                <input type="password" id="novaSenhaInputCore" placeholder="Digite a nova senha" style="width:100%; height:42px; padding:0 14px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; outline:none; color:#0f172a;">
                            </div>
                            <div>
                                <label style="font-size:10.5px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px;">Confirmar Nova Senha</label>
                                <input type="password" id="confirmaSenhaInputCore" placeholder="Confirme a nova senha" style="width:100%; height:42px; padding:0 14px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; outline:none; color:#0f172a;">
                            </div>
                            <button onclick="salvarNovaSenhaCore()" style="background:#2563eb; color:#fff; border:none; height:44px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 12px rgba(37,99,235,0.3);"><i class="fas fa-lock"></i> Atualizar Senha</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        aplicarWhiteLabelDinamico();
        inicializarCoreDados();

        const inputBusca = document.getElementById('inputBuscaGlobalCore');
        const dropdown = document.getElementById('dropdownResultadosCore');
        if (inputBusca && dropdown) {
            inputBusca.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (!query) { dropdown.style.display = 'none'; return; }
                let encontrados = rotasModulos.filter(m => m.nome.toLowerCase().includes(query) || m.keywords.some(k => k.includes(query)));
                if (encontrados.length === 0) {
                    dropdown.innerHTML = `<div class="search-dropdown-header">Resultados</div><div class="search-item" style="color:var(--text-light); padding:16px;">Nenhum módulo encontrado.</div>`;
                } else {
                    dropdown.innerHTML = `<div class="search-dropdown-header">Módulos Encontrados</div>${encontrados.map(m => `<a href="\${m.url}" class="search-item"><i class="fas ${m.icon}"></i> <span>${m.nome}</span></a>`).join('')}`;
                }
                dropdown.style.display = 'block';
            });
            document.addEventListener('click', (e) => { if (!e.target.closest('.search-global-box')) dropdown.style.display = 'none'; });
        }
    });

    window.alternarTemaNoite = function() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('erp_tema_noite', isDark);
        const btnTema = document.getElementById('btnModoTemaCore');
        if (btnTema) {
            btnTema.innerHTML = isDark ? '<i class="fas fa-sun" style="color:#f59e0b;"></i>' : '<i class="fas fa-moon" style="color:#ffd700;"></i>';
        }
    }

    async function aplicarWhiteLabelDinamico() {
        try {
            const u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
            if (!u) return;

            let clienteId = u.cliente_id || 1;
            const selEmpresa = localStorage.getItem('empresaSelecionada');
            if (selEmpresa) clienteId = parseInt(selEmpresa);

            const sb = window.supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei');
            const { data } = await sb.from('clientes_contratantes').select('*').eq('id', clienteId).maybeSingle();

            if (data) {
                const nomeEmpresa = data.nome_fantasia || data.razao_social || "Sacramento ERP";
                const titleEl = document.getElementById('brandTitleCore');
                if (titleEl) titleEl.innerText = nomeEmpresa;

                const logoBox = document.getElementById('brandLogoBoxCore');
                if (logoBox && data.logotipo_url) {
                    logoBox.innerHTML = `<img src="${data.logotipo_url}" alt="${nomeEmpresa}">`;
                }
            }
        } catch(e) {
            console.error("Erro no White-Label dinâmico:", e);
        }
    }

    async function inicializarCoreDados() {
        try {
            const u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
            if (u) {
                const el = document.getElementById('userNameCore');
                if (el) el.innerText = (u.nome || u.email || 'Usuário').split('@')[0];
            }
            await carregarSeletorEmpresaCore();
        } catch(err) {}
    }

    async function carregarSeletorEmpresaCore() {
        const select = document.getElementById('selectEmpresaCore');
        if (!select || !window.supabase) return;
        try {
            const sb = window.supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei');
            const { data } = await sb.from('clientes_contratantes').select('id, razao_social, nome_fantasia').order('id');
            if (!data) return;
            select.innerHTML = '';
            data.forEach(emp => {
                const nomeEmp = emp.nome_fantasia || emp.razao_social || ('Empresa ' + emp.id);
                const opt = document.createElement('option');
                opt.value = emp.id;
                opt.textContent = nomeEmp;
                select.appendChild(opt);
            });
            const selEmp = localStorage.getItem('empresaSelecionada');
            if (selEmp) select.value = selEmp;
        } catch(e) {}
    }

    window.trocarEmpresaCore = function() {
        const select = document.getElementById('selectEmpresaCore');
        if (!select) return;
        localStorage.setItem('empresaSelecionada', select.value);
        location.reload();
    }

    window.sairSistemaCore = function() {
        if (confirm('Deseja realmente encerrar a sessão?')) {
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('empresaSelecionada');
            location.href = 'login.html';
        }
    }

    window.abrirModalSenhaCore = function() {
        const m = document.getElementById('modalAlterarSenhaCore');
        if (m) m.style.display = 'flex';
    }

    window.fecharModalSenhaCore = function() {
        const m = document.getElementById('modalAlterarSenhaCore');
        if (m) m.style.display = 'none';
    }

    window.salvarNovaSenhaCore = async function() {
        const nova = document.getElementById('novaSenhaInputCore').value.trim();
        const conf = document.getElementById('confirmaSenhaInputCore').value.trim();
        if(!nova || !conf) { alert("Preencha todos os campos da senha!"); return; }
        if(nova !== conf) { alert("As senhas não coincidem!"); return; }
        
        const u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
        if (!u || !u.email) { alert("Usuário não logado."); return; }

        const sb = window.supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei');
        const { error } = await sb.auth.updateUser({ password: nova });
        if(error) { alert("Erro ao atualizar senha: " + error.message); return; }
        
        alert("Senha alterada com sucesso!");
        fecharModalSenhaCore();
        document.getElementById('novaSenhaInputCore').value = '';
        document.getElementById('confirmaSenhaInputCore').value = '';
    }
})();
