// erp-core.js — Motor Central de Interface e Inteligência do Sacramento ERP (White-Label Dinâmico em Todas as Páginas)

(function() {
    const styleId = 'erp-core-styles-v10';
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

            body { font-family: 'Inter', sans-serif; background-color: var(--bg); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; margin: 0; padding: 0; }

            /* ESTILIZAÇÃO DO BOTÃO DE CHAVE DE SENHA NO TOPO */
            .btn-chave-senha { background: transparent; border: none; color: #93c5fd; cursor: pointer; font-size: 14px; padding: 2px 6px; transition: 0.2s; display: inline-flex; align-items: center; }
            .btn-chave-senha:hover { color: #fff; transform: scale(1.1); }
        `;
        document.head.appendChild(style);
    }

    window.addEventListener('DOMContentLoaded', () => {
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

        // Garante que o botão da chave apareça ao lado do nome do usuário em todas as páginas
        inserirChaveSenhaNoHeader();

        // Aplica o nome e logotipo da empresa contratante em todas as páginas
        aplicarWhiteLabelEmTodasAsPaginas();
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

    function inserirChaveSenhaNoHeader() {
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
    }

    async function aplicarWhiteLabelEmTodasAsPaginas() {
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
                
                // Varre TODOS os títulos e cabeçalhos de marca nas páginas e subpastas
                const titles = document.querySelectorAll('#brandTitle, #brandTitleCore, .site-brand h1, h1');
                titles.forEach(el => {
                    if (el && (el.innerText.includes('Sacramento') || el.closest('.site-brand') || el.id.includes('brand'))) {
                        el.innerText = nomeEmpresa;
                    }
                });

                // Varre TODOS os containers de logotipo para injetar a imagem da empresa ativa
                const logoBoxes = document.querySelectorAll('#brandLogoBox, #brandLogoBoxCore, .brand-logo-box');
                logoBoxes.forEach(box => {
                    if (box && data.logotipo_url) {
                        box.innerHTML = `<img src="${data.logotipo_url}" alt="${nomeEmpresa}" style="width:100%; height:100%; object-fit:cover;">`;
                    }
                });
            }
        } catch(e) {
            console.error("Erro ao aplicar White-Label em todas as páginas:", e);
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
