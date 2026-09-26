// erp-core.js — Motor Central de Interface e Inteligência do Sacramento ERP (Versão Elite)

(function() {
    const styleId = 'erp-core-styles-elite';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            :root {
                --primary: #2563eb;
                --primary-dark: #1d4ed8;
                --secondary: #0f172a;
                --success: #10b981;
                --bg: #f8fafc;
                --card: #ffffff;
                --text-main: #0f172a;
                --text-light: #64748b;
                --border: #e2e8f0;
            }

            body { font-family: 'Inter', sans-serif; background-color: var(--bg); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; margin: 0; padding: 0; }

            /* HEADER EXECUTIVO DE ELITE */
            .site-header {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 14px 32px; display: flex; justify-content: space-between; align-items: center;
                box-shadow: 0 4px 20px rgba(15,23,42,0.15); position: sticky; top: 0; z-index: 1000; width: 100%; border-bottom: 1px solid rgba(255,255,255,0.08);
            }
            .site-brand { display: flex; align-items: center; gap: 14px; text-decoration: none; color: #fff; }
            .brand-logo-box { width: 42px; height: 42px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
            .brand-info h1 { font-size: 15px; font-weight: 800; letter-spacing: -0.3px; margin: 0; }
            .brand-info span { font-size: 9.5px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 700; }

            /* BARRA DE PESQUISA GLOBAL ELITE (SPOTLIGHT) */
            .search-global-box { position: relative; flex: 1; max-width: 420px; margin: 0 24px; }
            .search-global-box input { width: 100%; background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 16px 10px 42px; color: #fff; font-size: 13.5px; outline: none; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
            .search-global-box input::placeholder { color: #94a3b8; font-weight: 400; }
            .search-global-box input:focus { background: rgba(255,255,255,0.14); border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.25); }
            .search-global-box i { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #93c5fd; font-size: 14px; }
            
            .search-results-dropdown { position: absolute; top: calc(100% + 8px); left: 0; width: 100%; background: #ffffff; border-radius: 14px; box-shadow: 0 20px 40px rgba(15,23,42,0.2); display: none; z-index: 3000; overflow: hidden; border: 1px solid var(--border); animation: dropDownFade 0.2s ease; }
            @keyframes dropDownFade { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            
            .search-dropdown-header { padding: 10px 16px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: var(--text-light); background: #f8fafc; border-bottom: 1px solid var(--border); letter-spacing: 0.8px; }
            .search-item { padding: 12px 16px; font-size: 13.5px; color: var(--text-main); text-decoration: none; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); transition: 0.15s; font-weight: 500; }
            .search-item:last-child { border-bottom: none; }
            .search-item:hover { background: #eff6ff; color: var(--primary); padding-left: 20px; }
            .search-item i { width: 20px; color: var(--primary); font-size: 14px; text-align: center; }

            .site-nav-right { display: flex; align-items: center; gap: 16px; }
            .btn-topo-acao { background: rgba(255,255,255,0.08); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.15); padding: 8px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 7px; transition: 0.2s; }
            .btn-topo-acao:hover { background: rgba(255,255,255,0.18); color: #fff; border-color: rgba(255,255,255,0.3); }

            .empresa-selector { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 6px 12px; }
            .empresa-selector select { border: none; background: transparent; font-size: 12.5px; font-weight: 600; color: #fff; cursor: pointer; outline: none; }
            .empresa-selector select option { color: #000; background: #fff; }
            
            .user-box { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #cbd5e1; background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); }
            
            .btn-sair { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); padding: 8px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; transition: 0.2s; }
            .btn-sair:hover { background: #dc2626; color: #fff; border-color: #dc2626; }

            /* ASSISTENTE VIRTUAL FLUTUANTE DE ELITE */
            .assistant-widget { position: fixed; bottom: 30px; right: 30px; z-index: 4000; display: flex; flex-direction: column; align-items: flex-end; font-family: 'Inter', sans-serif; }
            .assistant-bubble { background: #ffffff; border: 1px solid var(--border); border-radius: 16px; padding: 14px 18px; box-shadow: 0 15px 35px rgba(15,23,42,0.12); max-width: 300px; margin-bottom: 12px; font-size: 13px; color: var(--text-main); position: relative; line-height: 1.5; font-weight: 500; animation: bubblePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            @keyframes bubblePop { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .assistant-bubble::after { content: ''; position: absolute; bottom: -8px; right: 24px; width: 14px; height: 14px; background: #fff; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); transform: rotate(45deg); }
            
            .assistant-avatar { width: 56px; height: 56px; background: linear-gradient(135deg, #2563eb, #1e3a8a); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; box-shadow: 0 8px 25px rgba(37,99,235,0.4); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 3px solid #fff; }
            .assistant-avatar:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 12px 30px rgba(37,99,235,0.5); }
        `;
        document.head.appendChild(style);
    }

    const rotasModulos = [
        { nome: "Portal Principal (Início)", url: "index.html", icon: "fa-home", keywords: ["inicio", "portal", "home", "principal"] },
        { nome: "Módulo Financeiro", url: "modulo_financeiro.html", icon: "fa-wallet", keywords: ["financeiro", "modulo"] },
        { nome: "Contas a Pagar", url: "contas_pagar.html", icon: "fa-file-invoice-dollar", keywords: ["pagar", "despesa", "fornecedor", "boleto"] },
        { nome: "Contas a Receber", url: "contas_receber.html", icon: "fa-hand-holding-usd", keywords: ["receber", "receita", "cliente", "fatura"] },
        { nome: "Contas Bancárias / Caixa", url: "contas_bancarias.html", icon: "fa-university", keywords: ["banco", "caixa", "saldo", "conta"] },
        { nome: "Fluxo de Caixa", url: "fluxo_caixa.html", icon: "fa-chart-line", keywords: ["fluxo", "caixa", "projecao", "entrada", "saida"] },
        { nome: "DRE Gerencial", url: "dre.html", icon: "fa-chart-pie", keywords: ["dre", "resultado", "contabil", "exercicio"] },
        { nome: "Parceiros & Clientes", url: "parceiros.html", icon: "fa-address-book", keywords: ["parceiro", "cliente", "fornecedor", "cnpj", "cadastro"] },
        { nome: "Centros de Custo", url: "centros_custo.html", icon: "fa-sitemap", keywords: ["centro", "custo", "projeto", "departamento"] },
        { nome: "Documentos XML", url: "documentos.html", icon: "fa-file-code", keywords: ["xml", "nota", "fiscal", "nfe", "cte"] },
        { nome: "Dashboard Analítico", url: "dashboard.html", icon: "fa-chart-bar", keywords: ["dashboard", "grafico", "executivo", "relatorio"] }
    ];

    const dicasAssistente = [
        "Dica Pro: Utilize a busca inteligente no topo para alternar entre os módulos em menos de um segundo.",
        "Dica Pro: Nos relatórios financeiros, você pode imprimir ou exportar sem os filtros operacionais.",
        "Dica Pro: Alterne o contexto empresarial instantaneamente através do seletor no cabeçalho superior.",
        "Dica Pro: Precisa de suporte a dados cadastrais? A consulta automática por CNPJ está ativa no módulo de Parceiros."
    ];

    window.addEventListener('DOMContentLoaded', () => {
        if (!document.querySelector('.site-header')) {
            const headerHtml = `
                <header class="site-header">
                    <a href="index.html" class="site-brand">
                        <div class="brand-logo-box"><i class="fas fa-cube"></i></div>
                        <div class="brand-info">
                            <h1>Sacramento ERP</h1>
                            <span>Portal Corporativo</span>
                        </div>
                    </a>

                    <div class="search-global-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="inputBuscaGlobalCore" placeholder="Pesquisar módulo ou rotina... (Ex: Pagar, Parceiros)" autocomplete="off">
                        <div class="search-results-dropdown" id="dropdownResultadosCore"></div>
                    </div>

                    <div class="site-nav-right">
                        <a href="index.html" class="btn-topo-acao"><i class="fas fa-home"></i> Início</a>
                        <div class="empresa-selector">
                            <i class="fas fa-building" style="color: #93c5fd;"></i>
                            <select id="selectEmpresaCore" onchange="trocarEmpresaCore()"></select>
                        </div>
                        <div class="user-box">
                            <i class="fas fa-user-circle" style="font-size: 16px; color: #93c5fd;"></i>
                            <span id="userNameCore">Usuário</span>
                        </div>
                        <button class="btn-sair" onclick="sairSistemaCore()"><i class="fas fa-sign-out-alt"></i> Sair</button>
                    </div>
                </header>
            `;
            document.body.insertAdjacentHTML('afterbegin', headerHtml);
        }

        if (!document.querySelector('.assistant-widget')) {
            const assistantHtml = `
                <div class="assistant-widget">
                    <div class="assistant-bubble" id="assistantTextCore">
                        Olá! Sou o seu assistente executivo. Como posso otimizar a sua gestão hoje?
                    </div>
                    <div class="assistant-avatar" onclick="falarComAssistenteCore()" title="Clique para ver uma dica executiva!">
                        <i class="fas fa-robot"></i>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', assistantHtml);
        }

        const inputBusca = document.getElementById('inputBuscaGlobalCore');
        const dropdown = document.getElementById('dropdownResultadosCore');

        if (inputBusca && dropdown) {
            inputBusca.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (!query) {
                    dropdown.style.display = 'none';
                    return;
                }

                let encontrados = rotasModulos.filter(m => 
                    m.nome.toLowerCase().includes(query) || m.keywords.some(k => k.includes(query))
                );

                if (encontrados.length === 0) {
                    dropdown.innerHTML = `
                        <div class="search-dropdown-header">Resultados da Busca</div>
                        <div class="search-item" style="color:var(--text-light); cursor:default; justify-content:center; padding: 16px;">Nenhum módulo encontrado.</div>
                    `;
                } else {
                    dropdown.innerHTML = `
                        <div class="search-dropdown-header">Módulos Encontrados (${encontrados.length})</div>
                        ${encontrados.map(m => `
                            <a href="${m.url}" class="search-item">
                                <i class="fas ${m.icon}"></i> <span>${m.nome}</span>
                            </a>
                        `).join('')}
                    `;
                }
                dropdown.style.display = 'block';
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-global-box')) {
                    dropdown.style.display = 'none';
                }
            });
        }

        inicializarCore();
    });

    async function inicializarCore() {
        try {
            const u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
            if (u) {
                const el = document.getElementById('userNameCore');
                if (el) el.innerText = (u.nome || u.email || 'Usuário').split(' ')[0];
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

    window.falarComAssistenteCore = function() {
        const txtEl = document.getElementById('assistantTextCore');
        const dica = dicasAssistente[Math.floor(Math.random() * dicasAssistente.length)];
        if (txtEl) {
            txtEl.style.opacity = '0';
            setTimeout(() => {
                txtEl.innerText = dica;
                txtEl.style.opacity = '1';
            }, 150);
        }
    }
})();
