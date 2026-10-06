/**
 * Sacramento ERP — Auth Guard & Motor de Isolamento Multi-Tenant Absoluto (LGPD)
 * Protege rotas, valida sessões, impede vazamento de dados e aplica o bloqueio por inadimplência.
 */

(async function () {
    const EMAIL_MASTER = "lucianojorgesacramento@gmail.com";
    const paginaAtual = window.location.pathname.split("/").pop();

    // Páginas públicas que não exigem autenticação
    const paginasPublicas = ['login.html', 'cadastro.html', 'recuperar.html'];
    if (paginasPublicas.includes(paginaAtual)) {
        return;
    }

    // 1. Validação estrita de Sessão do Utilizador
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

    // 2. Trava de Segurança Multi-Tenant Absoluta: Se não for Master, força estritamente o seu próprio cliente_id
    if (!ehMaster) {
        if (!usuario.cliente_id) {
            alert("Acesso negado: Utilizador sem empresa vinculada.");
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'login.html';
            return;
        }
        localStorage.setItem('empresaSelecionada', String(usuario.cliente_id));
    }

    // 3. Ajuste automático do Cabeçalho e Nome do Utilizador ao carregar o DOM
    window.addEventListener('DOMContentLoaded', async () => {
        // Exibe o nome real do utilizador no cabeçalho
        const elUserName = document.getElementById('userName');
        if (elUserName) {
            elUserName.innerText = (usuario.nome || usuario.email || 'Utilizador').split('@')[0];
        }

        // Se NÃO for Master, remove ou bloqueia rigorosamente o seletor de empresas em qualquer página
        if (!ehMaster) {
            const seletores = document.querySelectorAll('#selectEmpresa, #selectEmpresaHeader, .empresa-selector');
            seletores.forEach(sel => {
                if (sel) {
                    // Substitui o seletor por um bloco estático contendo apenas a empresa autorizada do utilizador
                    let parent = sel.closest('.empresa-selector') || sel.parentElement;
                    if (parent) {
                        parent.innerHTML = `<span style="font-size:12px; font-weight:600; color:#fff; display:flex; align-items:center; gap:6px;"><i class="fas fa-building" style="color:#93c5fd;"></i> Empresa Licenciada</span>`;
                    } else {
                        sel.style.display = 'none';
                    }
                }
            });
        } else {
            // Se for Master, garante o funcionamento do seletor nas páginas que o utilizarem
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

    // 4. Validação de Licença e Inadimplência via Supabase para Empresas Comuns
    try {
        if (typeof supabase === 'undefined') {
            console.error("Supabase SDK não carregado.");
            return;
        }

        const sb = supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei');
        let clienteId = parseInt(usuario.cliente_id);

        let { data: cliente, error } = await sb.from('clientes_contratantes').select('*').eq('id', clienteId).maybeSingle();

        if (error || !cliente) {
            console.warn("Não foi possível validar o contrato da empresa no Supabase.");
            return;
        }

        if (cliente.vitalicia) {
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
                            O acesso da empresa <strong>${cliente.razao_social || 'Contratante'}</strong> encontra-se temporariamente suspenso devido a pendências financeiras na fatura mensal (Vencimento dia ${diaVenc}).
                        </p>
                        <div style="background:#0f172a; padding:16px; border-radius:8px; font-size:13px; color:#cbd5e1; margin-bottom:24px; border-left:4px solid #ef4444;">
                            Regularize a sua situação junto ao suporte para restabelecer o acesso imediato ao sistema.
                        </div>
                        <button onclick="localStorage.removeItem('usuarioLogado'); location.href='login.html';" style="background:#2563eb; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-weight:700; cursor:pointer; font-size:13px;">
                            <i class="fas fa-sign-out-alt"></i> Voltar ao Login
                        </button>
                    </div>
                </div>
            `;
            throw new Error("Sistema bloqueado por inadimplência.");
        }

        if (diffDias >= 3 && diffDias <= 15) {
            window.addEventListener('DOMContentLoaded', () => {
                let avisoDiv = document.createElement('div');
                avisoDiv.style.cssText = "background:#fef3c7; color:#92400e; padding:10px 20px; font-size:13px; font-weight:600; text-align:center; border-bottom:1px solid #fde68a; position:sticky; top:0; z-index:9999; display:flex; justify-content:center; align-items:center; gap:8px;";
                avisoDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Atenção: Identificamos uma fatura em aberto com vencimento em ${diaVenc} deste mês. Evite o bloqueio regularizando o pagamento.`;
                document.body.prepend(avisoDiv);
            });
        }

    } catch (e) {
        if (e.message === "Sistema bloqueado por inadimplência.") {
            throw e;
        }
        console.error("Erro no motor de verificação de segurança:", e);
    }

})();
