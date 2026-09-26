// erp-core.js — Motor Central de Interface e Inteligência do Sacramento ERP

(function() {
    // Injeta os estilos globais de cabeçalho, busca e assistente
    const styleId = 'erp-core-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            :root {
                --primary: #2563eb;
                --secondary: #1e3a8a;
                --success: #10b981;
                --danger: #ef4444;
                --bg: #f8fafc;
                --card: #ffffff;
                --text-main: #0f172a;
                --text-light: #64748b;
                --border: #e2e8f0;
            }

            body { font-family: 'Inter', sans-serif; background-color: var(--bg); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; margin: 0; padding: 0; }

            /* HEADER DO SITE */
            .site-header {
                background: var(--secondary); color: #fff; padding: 16px 30px; display: flex; justify-content: space-between; align-items: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000; width: 100%;
            }
            .site-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #fff; }
            .brand-logo-box { width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; }
            .brand-info h1 { font-size: 15px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
            .brand-info span { font-size: 10px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }

            /* BARRA DE PESQUISA GLOBAL INTELIGENTE */
            .search-global-box { position: relative; flex: 1; max-width: 380px; margin: 0 20px; }
            .search-global-box input { width: 100%; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: 8px; padding: 8px 14px 8px 36px; color: #fff; font-size: 13px; outline: none; transition: 0.2s; }
            .search-global-box input::placeholder { color: #cbd5e1; }
            .search-global-box input:focus { background: rgba(255,255,255,0.2); border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(147,197,253,0.2); }
            .search-global-box i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #93c5fd; font-size: 13px; }
            
            .search-results-dropdown { position: absolute; top: calc(100% + 6px); left: 0; width: 100%; background: #fff; border-radius: 10px; box-shadow: 0 10px 25px rgba(15,23,42,0.15); display: none; z-index: 3000; overflow: hidden; border: 1px solid var(--border); }
            .search-item { padding: 10px 14px; font-size: 13px; color: var(--text-main); text-decoration: none; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); transition: 0.15s; }
            .search-item:hover { background: #eff6ff; color: var(--primary); }

            .site-nav-right { display: flex; align-items: center; gap: 14px; }
            .btn-topo-acao { background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.25); padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: 0.2s; }
            .btn-topo-acao:hover { background: rgba(255,255,255,0.22); }

            .empresa-selector { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 6px 12px; }
            .empresa-selector select { border: none; background: transparent; font-size: 12px; font-weight: 600; color: #fff; cursor: pointer; outline: none; }
            .empresa-selector select option { color: #000; }
            .user-box { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #e2e8f0; }
            .btn-sair { background: #dc2626; color: #fff; border: none; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: 0.2s; }
            .btn-sair:hover { background: #b91c1c; }

            /* MASCOTE / ASSISTENTE VIRTUAL FLUTUANTE */
            .assistant-widget { position: fixed; bottom: 25px; right: 25px; z-index: 4000; display: flex; flex-direction: column; align-items: flex-end; font-family: 'Inter', sans-serif; }
            .assistant-bubble { background: #fff; border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.12); max-width: 280px; margin-bottom: 10px; font-size: 12.5px; color: var(--text-main); position: relative; line-height: 1.4; }
            .assistant-bubble::after { content: ''; position: absolute; bottom: -7px; right: 22px; width: 12px; height: 12px; background: #fff; border-right: 1.5px solid var(--border); border-bottom: 1.5px solid var(--border); transform: rotate(45deg); }
            .assistant-avatar { width: 52px; height: 52px; background: linear-gradient(135deg, #2563eb, #1e3a8a); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; box-shadow: 0 6px 20px rgba(37,99,235,0.35); cursor: pointer; transition: transform 0.2s; border: 3px solid #fff; }
            .assistant-avatar:hover { transform: scale(1.1); }
        `;
        document.head.appendChild(style);
    }

    // Módulos do sistema para a busca inteligente
    const rotasModulos = [
        { nome: "Portal Principal (Início)", url: "index.html", keywords: ["inicio", "portal", "home", "principal"] },
        { nome: "Módulo Financeiro", url: "modulo_financeiro.html", keywords: ["financeiro", "modulo"] },
        { nome: "Contas a Pagar", url: "contas_pagar.html", keywords: ["pagar", "despesa", "fornecedor", "boleto"] },
        { nome: "Contas a Receber", url: "contas_receber.html", keywords: ["receber", "receita", "cliente", "fatura"] },
        { nome: "Contas Bancárias / Caixa", url: "contas_bancarias.html", keywords: ["banco", "caixa", "saldo", "conta"] },
        { nome: "Fluxo de Caixa", url: "fluxo_caixa.html", keywords: ["fluxo", "caixa", "projecao", "entrada", "saida"] },
        { nome: "DRE Gerencial", url: "dre.html", keywords: ["dre", "resultado", "contabil", "exercicio"] },
        { nome: "Parceiros & Clientes", url: "parceiros.html", keywords: ["parceiro", "cliente", "fornecedor", "cnpj", "cadastro"] },
        { nome: "Centros de Custo", url: "centros_custo.html", keywords: ["centro", "custo", "projeto", "departamento"] },
        { nome: "Documentos XML", url: "documentos.html", keywords: ["xml", "nota", "fiscal", "nfe", "cte"] },
        { nome: "Dashboard Analítico", url: "dashboard.html", keywords: ["dashboard", "grafico", "executivo", "relatorio"] }
    ];

    const dicasAssistente = [
        "Dica: Digite qualquer termo na barra de pesquisa superior para navegar instantaneamente entre os módulos!",
        "Dica: Use os relatórios operacionais com impressão em formato paisagem para obter um visual executivo limpo.",
        "Dica: Selecione a empresa contratante no canto superior direito para alternar o contexto contábil instantaneamente.",
        "Dica: Precisa de ajuda com preenchimento? Estou sempre por aqui para orientá-lo!"
    ];

    // Injeta o cabeçalho e o assistente assim que a página carregar
    window.addEventListener('DOMContentLoaded', () => {
        // 1. Cria e insere o Header caso ele ainda não exista na página
        if (!document.querySelector('.site-header')) {
            const headerHtml = `
                <header class="site-header">
                    <a href="index.html" class="site-brand">
                        <div class="brand-logo-box"><i class="fas fa-cube"></i></div>
                        <div class="brand-info">
                            <h1>Sacramento ERP</h1>
                            <span>Portal de Gestão</span>
                        </div>
                    </a>

                    <div class="search-global-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="inputBuscaGlobalCore" placeholder="O que você está procurando? (Ex: Pagar, Parceiros)..." autocomplete="off">
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

        // 2. Cria e insere o Widget do Assistente Flutuante
        if (!document.querySelector('.assistant-widget')) {
            const assistantHtml = `
                <div class="assistant-widget">
                    <div class="assistant-bubble" id="assistantTextCore">
                        Olá! Sou o assistente virtual do Sacramento ERP. Como posso ajudar na sua gestão hoje?
                    </div>
                    <div class="assistant-avatar" onclick="falarComAssistenteCore()" title="Clique para ver uma dica!">
                        <i class="fas fa-robot"></i>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', assistantHtml);
        }

        // 3. Configura a lógica de busca global
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
                    dropdown.innerHTML = `<div class="search-item" style="color:var(--text-light); cursor:default;">Nenhum módulo encontrado.</div>`;
                } else {
                    dropdown.innerHTML = encontrados.map(m => `
                        <a href="${m.url}" class="search-item">
                            <i class="fas fa-arrow-right" style="color:var(--primary);"></i> ${m.nome}
                        </a>
                    `).join('');
                }
                dropdown.style.display = 'block';
            });

            // Fecha o dropdown ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-global-box')) {
                    dropdown.style.display = 'none';
                }
            });
        }

        // Inicializa dados do usuário e seletor de empresas
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
        if (confirm('Deseja realmente sair do sistema?')) {
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('empresaSelecionada');
            location.href = 'login.html';
        }
    }

    window.falarComAssistenteCore = function() {
        const txtEl = document.getElementById('assistantTextCore');
        const dica = dicasAssistente[Math.floor(Math.random() * dicasAssistente.length)];
        if (txtEl) txtEl.innerText = dica;
    }
})();
