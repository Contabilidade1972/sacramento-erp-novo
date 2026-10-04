// auth-guard.js - Validação estrita de Sessão e LGPD para o Sacramento ERP
(function() {
    const EMAIL_MASTER = "lucianojorgesacramento@gmail.com";
    
    function verificarAutenticacao() {
        const usuarioStr = localStorage.getItem('usuarioLogado');
        
        // Se não houver usuário logado, expulsa para o login imediatamente
        if (!usuarioStr) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const usuario = JSON.parse(usuarioStr);
            const emailUser = (usuario.email || '').toLowerCase().trim();
            const ehMaster = (emailUser === EMAIL_MASTER.toLowerCase().trim());

            // Se NÃO for Master, o cliente_id DEVE pertencer estritamente ao usuário logado
            if (!ehMaster) {
                if (!usuario.cliente_id) {
                    alert("Erro de segurança: Usuário sem empresa vinculada.");
                    localStorage.removeItem('usuarioLogado');
                    localStorage.removeItem('empresaSelecionada');
                    window.location.href = 'login.html';
                    return;
                }
                
                // TRAVA DE SEGURANÇA LGPD: Força o localStorage a assumir unicamente o ID da empresa do usuário
                localStorage.setItem('empresaSelecionada', String(usuario.cliente_id));
            }
        } catch (e) {
            console.error("Erro no guardião de autenticação:", e);
            window.location.href = 'login.html';
        }
    }

    verificarAutenticacao();
})();
