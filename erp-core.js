// erp-core.js — Motor Central de Interface e Inteligência do Sacramento ERP (White-Label Universal 100% Garantido, Módulo Dinâmico & Tema Dia/Noite)

(function() {
    const styleId = 'erp-core-styles-v12';
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
                --bg: #0b1329;
                --card: #131c38;
                --text-main: #f8fafc;
                --text-light: #94a3b8;
                --border: #1e293b;
            }
            body.dark-mode .site-header { background: #070d1f !important; border-bottom: 1px solid #1e293b; }
            body.dark-mode .card, body.dark-mode .toolbar, body.dark-mode .dash-card { background: #131c38 !important; border-color: #1e293b !important; color: #f8fafc !important; }
            body.dark-mode table thead th { background: #1e293b !important; color: #cbd5e1 !important; }
            body.dark-mode tbody td { border-bottom-color: #1e293b !important; color: #f8fafc !important; }
            body.dark-mode tbody tr:hover { background: #1a2544 !important; }
            body.dark-mode footer { background: #070d1f !important; border-top-color: #1e293b !important; color: #94a3b8 !important; }

            body { font-family: 'Inter', sans-serif; background-color: var(--bg); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; margin: 0; padding: 0; transition: background 0.3s ease, color 0.3s ease; }

            /* HEADER CORPORATIVO PADRÃO UNIFICADO */
            .site-header {
                background: var(--secondary); color: #fff; padding: 14px 28px; display: flex; justify-content: space-between; align-items: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000; width: 100%;
            }
            .site-brand { display: flex; align-items: center; gap: 14px; text-decoration: none; color: #fff; }
            .brand-logo-box, [id*="LogoBox"] { width: 42px; height: 42px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.3); overflow: hidden; flex-shrink: 0; }
            .brand-logo-box img, [id*="LogoBox"] img { width: 100%; height: 100%; object-fit: cover; }
            .brand-info h1, [id*="Title"] { font-size: 14.5px; font-weight: 800; letter-spacing: -0.3px; margin: 0; color: #fff; line-height: 1.2; }
            .brand-info span { font-size: 9.5px; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-top: 2px; display: block; }

            /* BARRA DE PESQUISA GLOBAL ELITE */
            .search-global-box { position: relative; flex: 1; max-width: 320px; margin: 0 16px; }
            .search-global-box input { width: 100%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 7px 12px 7px 34px; color: #fff; font-size: 12.5px; outline: none; transition: all 0.2s ease; }
            .search-global-box input::placeholder { color: #cbd5e1; font-weight: 400; }
            .search-global-box input:focus { background: rgba(255,255,255,0.18); border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(147,197,253,0.2); }
            .search-global-box i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #93c5fd; font-size: 12px; }
            
            .search-results-dropdown { position: absolute; top: calc(100% + 8px); left: 0; width: 100%; background: #ffffff; border-radius: 10px; box-shadow: 0 10px 25px rgba(15,23,42,0.15); display: none; z-index: 3000; overflow: hidden; border: 1px solid var(--border); }
            .search-dropdown-header { padding: 10px 14px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-light); background: #f8fafc; border-bottom: 1px solid var(--border); letter-spacing: 0.8px; }
            .search-item { padding: 10px 14px; font-size: 13px; color: var(--text-main); text-decoration: none; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); transition: 0.15s; font-weight: 500; }
            .search-item:last-child { border-bottom: none; }
            .search-item:hover { background: #eff6ff; color: var(--primary); padding-left: 16px; }
            .search-item i { width: 18px; color: var(--primary); font-size: 13px; text-align: center; }

            .site-nav-right { display: flex; align-items: center; gap: 10px; }
            .btn-topo-acao { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 6px 10px; border-radius: 8px; font-size: 11.5px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: 0.2s; }
            .btn-topo-acao:hover { background: rgba(255,255,255,0.2); }

            .empresa-selector { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 4px 8px; }
            .empresa-selector select { border: none; background: transparent; font-size: 11.5px; font-weight: 600; color: #fff; cursor: pointer; outline: none; }
            .empresa-selector select option { color: #000; background: #fff; }
            
            .user-box { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #fff; background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); }
            .btn-chave-senha { background: transparent; border: none; color: #93c5fd; cursor: pointer; font-size: 13px; padding: 2px 4px; transition: 0.2s; display: inline-flex; align-items: center; }
            .btn-chave-senha:hover { color: #fff; transform: scale(1.1); }
            
            .btn-modo-tema { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); color: #ffd700; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: 0.2s; }
            .btn-modo-tema:hover { background: rgba(255,255,255,0.25); transform: scale(1.08); }

            .btn-sair { background: #dc2626; color: #fff; border: none; padding: 6px 10px; border-radius: 8px; font-size: 11.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: 0.2s; }
            .btn-sair:hover { background: #b91c1c; }

            /* PAINEL DE ASSISTENTE VIRTUAL INTERATIVO */
            .assistant-widget { position: fixed; bottom: 30px; right: 30px; z-index: 4000; font-family: 'Inter', sans-serif; }
            .assistant-trigger { width: 58px; height: 58px; background: linear-gradient(135deg, #2563eb, #1e3a8a); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; box-shadow: 0 10px 30px rgba(37,99,235,0.4); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 3px solid #fff; position: relative; }
            .assistant-trigger:hover { transform: scale(1.08); box-shadow: 0 15px 35px rgba(37,99,235,0.5); }
            .assistant-badge { position: absolute; top: 0; right: 0; width: 16px; height: 16px; background: #10b981; border-radius: 50%; border: 2px solid #fff; }

            .assistant-chat-box { position: absolute; bottom: 75px; right: 0; width: 340px; background: #fff; border-radius: 16px; box-shadow: 0 20px 50px rgba(15,23,42,0.2); border: 1px solid var(--border); display: none; flex-direction: column; overflow: hidden; animation: chatPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            @keyframes chatPop { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

            .chat-header { background: var(--secondary); color: #fff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 700; }
            .chat-header span { display: flex; align-items: center; gap: 8px; }
            .chat-close { background: transparent; border: none; color: #cbd5e1; font-size: 16px; cursor: pointer; transition: 0.15s; }
            .chat-close:hover { color: #fff; }

            .chat-body { padding: 16px; height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #f8fafc; font-size: 13px; }
            .chat-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; line-height: 1.4; }
            .chat-msg.bot { background: #fff; color: var(--text-main); align-self: flex-start; border: 1px solid var(--border); box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
            .chat-msg.user { background: var(--primary); color: #fff; align-self: flex-end; }

            .chat-footer { padding: 12px; background: #fff; border-top: 1px solid var(--border); display: flex; gap: 8px; }
            .chat-footer input { flex: 1; height: 38px; border: 1px solid var(--border); border-radius: 8px; padding: 0 12px; font-size: 12.5px; outline: none; }
            .chat-footer input:focus { border-color: var(--primary); }
            .chat-footer button { background: var(--primary); color: #fff; border: none; width: 38px; height: 38px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .chat-footer button:hover { background: var(--primary-dark); }
        `;
        document.head.appendChild(style);
    }

    window.addEventListener('DOMContentLoaded', () => {
        // Aplica o tema salvo (Dia / Noite) imediatamente
        if (localStorage.getItem('erp_tema_noite') === 'true') {
            document.body.classList.add('dark-mode');
        }

        // Injeta o modal de alteração de senha globalmente se não existir
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

        // Adiciona o botão de tema (lua/sol) e a chave de senha
        inserirBotaoTemaEChave();

        // Aplica White-Label universal (Nome, Logotipo e Módulo de Referência em TODAS as páginas e headers estáticos)
        aplicarWhiteLabelUniversalGarantido();
    });

    window.abrirModalSenhaCore = function() { document.getElementById('modalAlterarSenhaCore').style.display = 'flex'; }
    window.fecharModalSenhaCore = function() { document.getElementById('modalAlterarSenhaCore').style.display = 'none'; }

    window.salvarNovaSenhaCore = async function() {
        const novaSenha = document.getElementById('novaSenhaInputCore').value.trim();
        const confirmaSenha = document.getElementById('confirmaSenhaInputCore').value.trim();
        
        if (!novaSenha || novaSenha.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (novaSenha !== confirmaSenha) {
            alert("As senhas digitadas não coincidem. Por favor, confirme corretamente.");
            return;
        }

        const u = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
        if (!u || !u.email) {
            alert("Sessão expirada. Faça login novamente.");
            location.href = 'login.html';
            return;
        }
        const sb = window.supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei');
        const { error } = await sb.from('usuarios').update({ senha: novaSenha }).eq('email', u.email);
        if (error) {
            alert("Erro ao atualizar senha: " + error.message);
            return;
        }
        alert("Senha atualizada com sucesso!");
        fecharModalSenhaCore();
        document.getElementById('novaSenhaInputCore').value = '';
        document.getElementById('confirmaSenhaInputCore').value = '';
    }

    window.alternarTemaNoite = function() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('erp_tema_noite', isDark);
        const btnTema = document.getElementById('btnModoTemaCore');
        if (btnTema) {
            btnTema.innerHTML = isDark ? '<i class="fas fa-sun" style="color:#f59e0b;"></i>' : '<i class="fas fa-moon" style="color:#ffd700;"></i>';
        }
    }

    function inserirBotaoTemaEChave() {
        const userBoxes = document.querySelectorAll('.user-box');
        userBoxes.forEach(box => {
            if (!box.querySelector('.btn-chave-senha')) {
                const btnChave = document.createElement('button');
                btnChave.className = 'btn-chave-senha';
                btnChave.title = 'Alterar Senha';
                btnChave.innerHTML = '<i class="fas fa-key"></i>';
                btnChave.onclick = abrirModalSenhaCore;
                box.appendChild(btnChave);
            }
        });

        const navRights = document.querySelectorAll('.site-nav-right');
        navRights.forEach(nav => {
            if (!nav.querySelector('#btnModoTemaCore')) {
                const isDark = document.body.classList.contains('dark-mode');
                const btnTema = document.createElement('button');
                btnTema.id = 'btnModoTemaCore';
                btnTema.className = 'btn-modo-tema';
                btnTema.title = 'Alternar Modo Dia / Noite';
                btnTema.innerHTML = isDark ? '<i class="fas fa-sun" style="color:#f59e0b;"></i>' : '<i class="fas fa-moon" style="color:#ffd700;"></i>';
                btnTema.onclick = alternarTemaNoite;
                nav.insertBefore(btnTema, nav.firstChild);
            }
        });
    }

    async function aplicarWhiteLabelUniversalGarantido() {
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
                
                // Determina o subtítulo do módulo com base na URL atual
                const path = window.location.pathname.toLowerCase();
                let nomeModulo = "ERP PORTAL CORPORATIVO";
                if (path.includes("modulo_financeiro")) nomeModulo = "ERP MÓDULO FINANCEIRO";
                else if (path.includes("contas_pagar")) nomeModulo = "CONTAS A PAGAR";
                else if (path.includes("contas_receber")) nomeModulo = "CONTAS A RECEBER";
                else if (path.includes("dre")) nomeModulo = "DRE GERENCIAL";
                else if (path.includes("fluxo_caixa")) nomeModulo = "FLUXO DE CAIXA";
                else if (path.includes("dashboard")) nomeModulo = "DASHBOARD EXECUTIVO";
                else if (path.includes("auditoria")) nomeModulo = "TRILHA DE AUDITORIA";
                else if (path.includes("cte")) nomeModulo = "TRANSPORTE & LOGÍSTICA (CT-E)";
                else if (path.includes("parceiros")) nomeModulo = "CADASTRO DE PARCEIROS";

                // Varre TODOS os elementos de cabeçalho (.brand-info) em qualquer página do ERP
                const brandInfos = document.querySelectorAll('.brand-info');
                brandInfos.forEach(info => {
                    let h1 = info.querySelector('h1');
                    let span = info.querySelector('span');
                    if (h1) h1.innerText = nomeEmpresa;
                    if (span) span.innerText = nomeModulo;
                });

                // Varre qualquer H1 ou título que contenha Sacramento
                const allElements = document.querySelectorAll('h1, .site-brand h1, #brandTitle, #brandTitleCore');
                allElements.forEach(el => {
                    if (el && (el.innerText.includes('Sacramento') || el.closest('.site-brand'))) {
                        el.innerText = nomeEmpresa;
                    }
                });

                // Varre TODOS os blocos de logotipo em qualquer página
                const logoBoxes = document.querySelectorAll('.brand-logo-box, [id*="LogoBox"]');
                logoBoxes.forEach(box => {
                    if (box && data.logotipo_url) {
                        box.innerHTML = `<img src="${data.logotipo_url}" alt="${nomeEmpresa}">`;
                    }
                });
            }
        } catch(e) {
            console.error("Erro ao aplicar White-Label Universal Garantido:", e);
        }
    }
})();

// ==========================================================
// INJETOR GLOBAL DO BOTÃO FLUTUANTE DE AJUDA — SACRAMENTO ERP
// ==========================================================
(function () {
    if (window.location.pathname.toLowerCase().includes('central_ajuda.html')) return;

    window.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('btnAjudaGlobalFlutuante')) {
            const btn = document.createElement('button');
            btn.id = 'btnAjudaGlobalFlutuante';
            btn.title = 'Central de Ajuda';
            btn.innerHTML = '<i class="fas fa-question"></i>';
            btn.style.cssText = `
                position: fixed; bottom: 24px; right: 24px; z-index: 999999;
                width: 52px; height: 52px; border-radius: 50%; background: #2563eb; color: #fff;
                border: none; font-size: 22px; font-weight: bold; cursor: pointer;
                box-shadow: 0 6px 20px rgba(37,99,235,0.45); display: flex; align-items: center; 
                justify-content: center; transition: all 0.2s ease;
            `;
            btn.onmouseover = () => { btn.style.background = '#1d4ed8'; btn.style.transform = 'scale(1.08)'; };
            btn.onmouseout = () => { btn.style.background = '#2563eb'; btn.style.transform = 'scale(1)'; };
            btn.onclick = function () { 
                window.location.href = 'central_ajuda.html'; 
            };
            document.body.appendChild(btn);
        }
    });
})();
