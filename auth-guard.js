// Security Guard — Proteção de Sessão do Sacramento ERP
(function() {
    const paginaAtual = window.location.pathname.split('/').pop();
    
    // Se não estiver na página de login, verifica a sessão
    if (paginaAtual !== 'login.html' && paginaAtual !== '') {
        const usuario = localStorage.getItem('usuarioLogado');
        if (!usuario) {
            // Redireciona imediatamente para o login se não houver sessão ativa
            window.location.href = 'login.html';
        }
    }
})();

function sairSistema() {
    if (confirm('Deseja realmente encerrar a sessão?')) {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('empresaSelecionada');
        window.location.href = 'login.html';
    }
}
