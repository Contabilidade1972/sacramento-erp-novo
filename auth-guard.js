// auth-guard.js — Blindagem Absoluta Multi-Tenant e LGPD para o Sacramento ERP
(function() {
    const EMAIL_MASTER = "lucianojorgesacramento@gmail.com";
    
    function validarSegurancaSessao() {
        const usuarioStr = localStorage.getItem('usuarioLogado');
        
        if (!usuarioStr) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const usuario = JSON.parse(usuarioStr);
            const emailUser = (usuario.email || '').toLowerCase().trim();
            const ehMaster = (emailUser === EMAIL_MASTER.toLowerCase().trim());

            if (!ehMaster) {
                // Se o usuário comum não tiver um cliente_id válido, expulsa imediatamente
                if (!usuario.cliente_id) {
                    localStorage.removeItem('usuarioLogado');
                    localStorage.removeItem('empresaSelecionada');
                    window.location.href = 'login.html';
                    return;
                }
                
                // TRAVA DE SEGURANÇA LEI LGPD: NUNCA permite que o ID da empresa seja diferente do ID do usuário
                localStorage.setItem('empresaSelecionada', String(usuario.cliente_id));
            } else {
                // Se for Master e não houver empresa selecionada, define um padrão seguro
                if (!localStorage.getItem('empresaSelecionada')) {
                    localStorage.setItem('empresaSelecionada', '1');
                }
            }
        } catch (e) {
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('empresaSelecionada');
            window.location.href = 'login.html';
        }
    }

    validarSegurancaSessao();
})();
