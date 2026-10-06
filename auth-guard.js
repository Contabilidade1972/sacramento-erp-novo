/**
 * Sacramento ERP — Auth Guard & Blindagem Multi-Tenant Definitiva (LGPD)
 * Remove automaticamente seletores de empresa para utilizadores comuns e bloqueia acessos cruzados.
 */

(async function () {
    const EMAIL_MASTER = "lucianojorgesacramento@gmail.com";
    const paginaAtual = window.location.pathname.split("/").pop();

    // Páginas públicas livres de autenticação
    const paginasPublicas = ['login.html', 'cadastro.html', 'recuperar.html'];
    if (paginasPublicas.includes(paginaAtual)) {
        return;
    }

    // 1. Validação de Sessão do Utilizador
    let usuarioStr = localStorage.getItem('usuarioLogado');
    if (!usuarioStr) {
        window.location.href = 'login.html';
        return;
    }

    let usuario;
    try {
        usuario = JSON.parse(usuarioStr);
    } catch (e) {
        localStorage.removeItem('usuarioLogado');
        window.location.href = 'login.html';
        return;
    }

    const ehMaster = Boolean(usuario.email && usuario.email.toLowerCase().trim() === EMAIL_MASTER.toLowerCase().trim());

    // 2. Trava Absoluta Multi-Tenant para Utilizadores Comuns
    if (!ehMaster) {
        if (!usuario.cliente_id) {
            alert("Acesso negado: Utilizador sem empresa vinculada.");
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'login.html';
            return;
        }
        // Força estritamente o ID do cliente no cache para impedir qualquer tentativa de manipulação
        localStorage.setItem('empresaSelecionada', String(usuario.cliente_id));
    }

    // 3. Execução automática ao carregar o conteúdo da página (DOM)
    window.addEventListener('DOMContentLoaded', async () => {
        // Exibe o nome correto do utilizador no cabeçalho (ex: Fernanda)
        const elUserName = document.getElementById('userName');
        if (elUserName) {
            elUserName.innerText = (usuario.nome || usuario.email || 'Utilizador').split('@')[0];
        }

        // BLINDAGEM VISUAL LGPD: Se NÃO for o Master, oculta e destrói qualquer seletor de empresas do cabeçalho
        if (!ehMaster) {
            const seletores = document.querySelectorAll('#selectEmpresa, #selectEmpresaHeader, .empresa-selector, #boxSeletorEmpresa');
            seletores.forEach(sel => {
                if (sel) {
                    sel.style.setProperty('display', 'none', 'important');
                    // Se estiver dentro de um bloco de container do cabeçalho, substitui por um rótulo seguro
                    let parent = sel.closest('.empresa-selector') || sel.parentElement;
                    if (parent && parent !== document.body) {
                        parent.style.display = 'none';
                    }
                }
            });
        } else {
            // Se for o Master, popula e ativa o seletor normalmente nas páginas administrativas
            const select = document.getElementById('selectEmpresa') || document.getElementById('selectEmpresaHeader');
            if (select && typeof supabase !== 'undefined') {
                try {
                    const sb = supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei');
                    const { data } = await sb.from('clientes_contratantes').select('id, razao_social, nome_fantasia').order('id');
                    if (data) {
                        select.innerHTML = '';
                        data.forEach(emp => {
                            const nome = emp.nome_fantasia || emp.razao_social || ('Empresa ' + emp.id);
                            select.innerHTML += `<option value="${emp.id}">${nome}</option>`;
                        });
                        const selAtual = localStorage.getItem('empresaSelecionada') || String(usuario.cliente_id);
                        select.value = selAtual;
                    }
                } catch(err) {
                    console.error("Erro ao carregar empresas para o Master:", err);
                }
            }
        }
    });

    if (ehMaster) {
        return;
    }

    // 4. Validação de Inadimplência e Licença via Supabase para Empresas Comuns
    try {
        if (typeof supabase === 'undefined') return;

        const sb = supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei');
        let clienteId = parseInt(usuario.cliente_id);

        let { data: cliente, error } = await sb.from('clientes_contratantes').select('*').eq('id', clienteId).maybeSingle();

        if (error || !cliente || cliente.vitalicia) {
            return;
        }

        let hoje = new Date();
        let diaAtual = hoje.getDate();
        let diaVenc = parseInt(cliente.dia_vencimento || 10);
        let diffDias = diaAtual - diaVenc;

        if (diffDias > 15 || (cliente.status && cliente.status.toLowerCase() === 'bloqueado')) {
            document.body.innerHTML = `
                <div style="font-family:'Inter',sans-serif; background:#0f172a; color:#fff; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px;">
                    <div style="background:#1e293b; border:1px solid #334155; padding:40px; border-radius:16px; max-width:550px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
                        <div style="font-size:48px; color:#ef4444; margin-bottom:16px;"><i class="fas fa-lock"></i></div>
                        <h2 style="font-size:22px; font-weight:800; margin-bottom:12px; color:#f8fafc;">Acesso Suspenso por Inadimplência</h2>
                        <p style="font-size:14px; color:#94a3b8; line-height:1.6; margin-bottom:24px;">
                            O acesso da empresa <strong>${cliente.razao_social || 'Contratante'}</strong> encontra-se temporariamente suspenso devido a pendências financeiras.
                        </p>
                        <button onclick="localStorage.removeItem('usuarioLogado'); location.href='login.html';" style="background:#2563eb; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-weight:700; cursor:pointer; font-size:13px;">
                            <i class="fas fa-sign-out-alt"></i> Voltar ao Login
                        </button>
                    </div>
                </div>
            `;
            throw new Error("Sistema bloqueado por inadimplência.");
        }
    } catch (e) {
        if (e.message === "Sistema bloqueado por inadimplência.") {
            throw e;
        }
    }

})();
