/**
 * Sacramento ERP — Auth Guard & Motor de Segurança Financeira (Multi-Tenant)
 * Protege as rotas, valida sessões e aplica o bloqueio automático por inadimplência.
 */

(async function () {
    const EMAIL_MASTER = "lucianojorgesacramento@gmail.com";
    const paginaAtual = window.location.pathname.split("/").pop();

    // Páginas públicas que não exigem verificação de login
    const paginasPublicas = ['login.html', 'cadastro.html', 'recuperar.html'];

    if (paginasPublicas.includes(paginaAtual)) {
        return; // Permite acesso livre às páginas públicas
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

    // O utilizador Master tem passe livre em todas as rotas e validações financeiras
    if (usuario.email && usuario.email.toLowerCase().trim() === EMAIL_MASTER.toLowerCase().trim()) {
        return;
    }

    // 2. Validação e Conexão com o Supabase para Checagem de Licença
    try {
        if (typeof supabase === 'undefined') {
            console.error("Supabase SDK não carregado.");
            return;
        }

        // URL e Chave pública do projeto Supabase
        const sb = supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei');
        
        // Identifica o ID da empresa do utilizador logado
        let clienteId = usuario.cliente_id;
        if (!clienteId) {
            // Tenta resgatar da seleção salva em cache
            let sel = localStorage.getItem('empresaSelecionada');
            if (sel) clienteId = parseInt(sel);
        }

        if (!clienteId) {
            return; // Se não houver vínculo de empresa, prossegue com cautela
        }

        // Consulta a tabela de clientes contratantes para verificar a licença e status
        let { data: cliente, error } = await sb.from('clientes_contratantes').select('*').eq('id', clienteId).maybeSingle();

        if (error || !cliente) {
            console.warn("Não foi possível validar o contrato da empresa no Supabase.");
            return;
        }

        // Se a licença for vitalícia, o acesso é liberado permanentemente
        if (cliente.vitalicia) {
            return;
        }

        // Cálculo dinâmico do status financeiro com base no dia do vencimento mensal
        let hoje = new Date();
        let diaAtual = hoje.getDate();
        let diaVenc = parseInt(cliente.dia_vencimento || 10);
        
        // Simulação de diferença de dias para o vencimento
        let diffDias = diaAtual - diaVenc;

        // Regra 1: Bloqueio por Inadimplência (mais de 15 dias após o vencimento)
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
                            Regularize a sua situação com o desenvolvedor / suporte para restabelecer o acesso imediato ao sistema.
                        </div>
                        <button onclick="localStorage.removeItem('usuarioLogado'); location.href='login.html';" style="background:#2563eb; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-weight:700; cursor:pointer; font-size:13px;">
                            <i class="fas fa-sign-out-alt"></i> Voltar ao Login
                        </button>
                    </div>
                </div>
            `;
            throw new Error("Sistema bloqueado por inadimplência.");
        }

        // Regra 2: Aviso Prévio (entre 3 e 15 dias após o vencimento)
        if (diffDias >= 3 && diffDias <= 15) {
            window.addEventListener('DOMContentLoaded', () => {
                let avisoDiv = document.createElement('div');
                avisoDiv.style.cssText = "background:#fef3c7; color:#92400e; padding:10px 20px; font-size:13px; font-weight:600; text-align:center; border-bottom:1px solid #fde68a; position:sticky; top:0; z-index:9999; display:flex; justify-content:center; align-items:center; gap:8px;";
                avisoDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Atenção: Identificamos uma fatura em aberto com vencimento em ${diaVenc} deste mês. Evite o bloqueio regularizando o pagamento junto ao suporte.`;
                document.body.prepend(avisoDiv);
            });
        }

    } catch (e) {
        if (e.message === "Sistema bloqueado por inadimplência.") {
            throw e; // Interrompe a execução normal da página
        }
        console.error("Erro no motor de verificação de segurança:", e);
    }

})();
