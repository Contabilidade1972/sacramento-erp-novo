/**
 * Sacramento ERP — Auth Guard, Blindagem Multi-Tenant (LGPD) & Agente Operacional Autónomo (Pro)
 */

(async function () {
    const EMAIL_MASTER = "lucianojorgesacramento@gmail.com";
    const paginaAtual = window.location.pathname.split("/").pop().toLowerCase();

    const paginasPublicas = ['login.html', 'cadastro.html', 'recuperar.html'];
    if (paginasPublicas.includes(paginaAtual)) {
        return;
    }

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

    if (!ehMaster) {
        if (!usuario.cliente_id) {
            alert("Acesso negado: Utilizador sem empresa vinculada.");
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'login.html';
            return;
        }
        localStorage.setItem('empresaSelecionada', String(usuario.cliente_id));
    }

    window.addEventListener('DOMContentLoaded', async () => {
        const elUserName = document.getElementById('userName');
        if (elUserName) {
            elUserName.innerText = (usuario.nome || usuario.email || 'Utilizador').split('@')[0];
        }

        if (!paginaAtual.includes('central_ajuda.html')) {
            injetarAgenteOperacionalPro(paginaAtual, usuario);
        }

        if (!ehMaster) {
            const seletores = document.querySelectorAll('#selectEmpresa, #selectEmpresaHeader, .empresa-selector, #boxSeletorEmpresa');
            seletores.forEach(sel => {
                if (sel) {
                    sel.style.setProperty('display', 'none', 'important');
                    let parent = sel.closest('.empresa-selector') || sel.parentElement;
                    if (parent && parent !== document.body) {
                        parent.style.display = 'none';
                    }
                }
            });
        } else {
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

    // ==========================================================
    // MOTOR DO AGENTE OPERACIONAL AUTÓNOMO (PRO)
    // ==========================================================
    function injetarAgenteOperacionalPro(pagina, user) {
        if (document.getElementById('containerAgenteOperacional')) return;

        const container = document.createElement('div');
        container.id = 'containerAgenteOperacional';
        container.innerHTML = `
            <div id="painelAgenteChat" style="display:none; position:fixed; bottom:90px; right:24px; width:380px; background:#fff; border-radius:16px; box-shadow:0 20px 50px rgba(15,23,42,0.3); border:1px solid #cbd5e1; z-index:999998; overflow:hidden; font-family:'Inter',sans-serif; flex-direction:column;">
                <div style="background:#1e3a8a; color:#fff; padding:14px 18px; display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:13.5px; display:flex; align-items:center; gap:8px;"><i class="fas fa-robot" style="color:#60a5fa;"></i> Agente Operacional IA</strong>
                    <button id="fecharAgenteChat" style="background:none; border:none; color:#cbd5e1; font-size:16px; cursor:pointer;"><i class="fas fa-times"></i></button>
                </div>
                <div id="corpoAgenteChat" style="padding:16px; height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:12px; background:#f8fafc; font-size:12.5px; color:#334155;">
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:10px 14px; border-radius:10px; max-width:92%; align-self:flex-start; box-shadow:0 2px 5px rgba(0,0,0,0.02); line-height:1.5;">
                        Olá, <strong>${(user.nome || 'Utilizador').split(' ')[0]}</strong>! Estou conectado à sua base de dados. Como posso ajudar nas rotinas desta página ou localizar contas em aberto agora mesmo?
                    </div>
                </div>
                <div style="padding:10px 14px; background:#fff; border-top:1px solid #e2e8f0; display:flex; gap:6px; flex-wrap:wrap;">
                    <button class="acao-pill" data-acao="contas_aberto" style="background:#eff6ff; border:1px solid #bfdbfe; color:#1d4ed8; padding:5px 10px; border-radius:12px; font-size:11px; cursor:pointer; font-weight:600;">🔍 Listar Contas em Aberto</button>
                    <button class="acao-pill" data-acao="ir_pagar" style="background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; padding:5px 10px; border-radius:12px; font-size:11px; cursor:pointer; font-weight:600;">💸 Ir para Contas a Pagar</button>
                    <button class="acao-pill" data-acao="preencher_automatico" style="background:#fffbeb; border:1px solid #fde68a; color:#b45309; padding:5px 10px; border-radius:12px; font-size:11px; cursor:pointer; font-weight:600;">⚡ Sugerir Preenchimento</button>
                </div>
                <div style="padding:12px 14px; background:#fff; border-top:1px solid #e2e8f0; display:flex; gap:8px;">
                    <input type="text" id="inputAgenteChat" placeholder="Digite sua ordem ou dúvida..." style="flex:1; height:38px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; font-size:12.5px; outline:none;">
                    <button id="enviarAgenteChat" style="background:#2563eb; color:#fff; border:none; width:38px; height:38px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center;"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
            <button id="btnDisparadorAgente" title="Agente Operacional IA" style="position:fixed; bottom:24px; right:24px; z-index:999999; width:54px; height:54px; border-radius:50%; background:#2563eb; color:#fff; border:none; font-size:22px; cursor:pointer; box-shadow:0 6px 20px rgba(37,99,235,0.45); display:flex; align-items:center; justify-content:center; transition:all 0.2s ease;">
                <i class="fas fa-robot"></i>
            </button>
        `;

        document.body.appendChild(container);

        const btn = document.getElementById('btnDisparadorAgente');
        const painel = document.getElementById('painelAgenteChat');
        const fechar = document.getElementById('fecharAgenteChat');
        const input = document.getElementById('inputAgenteChat');
        const enviar = document.getElementById('enviarAgenteChat');
        const corpo = document.getElementById('corpoAgenteChat');

        btn.onclick = () => {
            painel.style.display = painel.style.display === 'flex' ? 'none' : 'flex';
        };
        fechar.onclick = () => { painel.style.display = 'none'; };

        async function executarAcaoInteligente(acao) {
            if (acao === 'ir_pagar') {
                corpo.innerHTML += `<div style="background:#2563eb; color:#fff; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-end;">Ir para Contas a Pagar</div>`;
                corpo.innerHTML += `<div style="background:#fff; border:1px solid #e2e8f0; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-start; line-height:1.5;">Redirecionando para o subsistema de Contas a Pagar...</div>`;
                setTimeout(() => { window.location.href = 'contas_pagar.html'; }, 800);
                return;
            }

            if (acao === 'contas_aberto') {
                corpo.innerHTML += `<div style="background:#2563eb; color:#fff; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-end;">Listar Contas em Aberto</div>`;
                corpo.innerHTML += `<div style="background:#fff; border:1px solid #e2e8f0; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-start;">A consultar base de dados...</div>`;
                corpo.scrollTop = corpo.scrollHeight;

                try {
                    const sb = supabase.createClient('https://vcuhkvqrbkyulnnyqnbf.supabase.co', 'sb_publishable_Dee0dPFyiuzYkz8Zbx_hrA_RqSZeWei');
                    const clienteId = user.cliente_id || 1;
                    const { data, error } = await sb.from('contas_pagar').select('*').eq('cliente_id', clienteId).limit(3);

                    if (error || !data || data.length === 0) {
                        corpo.innerHTML += `<div style="background:#fff; border:1px solid #e2e8f0; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-start;">Não foram encontradas contas em aberto pendentes para esta empresa. <br><button onclick="window.location.href='contas_pagar.html'" style="margin-top:6px; background:#2563eb; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600;">Abrir Módulo de Pagamentos</button></div>`;
                    } else {
                        let htmlLista = `<strong>Encontrei os seguintes títulos:</strong><ul style="margin-top:6px; padding-left:14px;">`;
                        data.forEach(t => {
                            htmlLista += `<li><strong>${t.fornecedor || 'Fornecedor'}</strong>: R$ ${t.valor || '0,00'} (Venc: ${t.vencimento || 'N/A'})</li>`;
                        });
                        htmlLista += `</ul><button onclick="window.location.href='contas_pagar.html'" style="margin-top:8px; background:#2563eb; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600;"><i class="fas fa-external-link-alt"></i> Gerenciar em Contas a Pagar</button>`;
                        corpo.innerHTML += `<div style="background:#fff; border:1px solid #e2e8f0; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-start; line-height:1.5;">${htmlLista}</div>`;
                    }
                } catch(err) {
                    corpo.innerHTML += `<div style="background:#fff; border:1px solid #e2e8f0; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-start;">Erro ao conectar com o Supabase. <a href="contas_pagar.html" style="color:#2563eb; font-weight:700;">Clique aqui para aceder diretamente ao módulo</a>.</div>`;
                }
                corpo.scrollTop = corpo.scrollHeight;
                return;
            }

            if (acao === 'preencher_automatico') {
                corpo.innerHTML += `<div style="background:#2563eb; color:#fff; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-end;">Sugerir Preenchimento</div>`;
                
                // Tenta preencher automaticamente inputs na tela atual se existirem
                const inputFornecedor = document.querySelector('input[name*="fornecedor"], input[id*="fornecedor"], input[placeholder*="fornecedor"]');
                const inputValor = document.querySelector('input[name*="valor"], input[id*="valor"]');

                if (inputFornecedor) inputFornecedor.value = "Fornecedor Exemplo Homologado Ltda";
                if (inputValor) inputValor.value = "1500.00";

                corpo.innerHTML += `<div style="background:#fff; border:1px solid #e2e8f0; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-start; line-height:1.5;">✨ Preenchi os campos disponíveis nesta página com dados de teste seguros. Pode revisar os valores antes de gravar!</div>`;
                corpo.scrollTop = corpo.scrollHeight;
                return;
            }
        }

        document.querySelectorAll('.acao-pill').forEach(pill => {
            pill.onclick = () => executarAcaoInteligente(pill.getAttribute('data-acao'));
        });

        function processarTextoLivre(texto) {
            if (!texto.trim()) return;
            corpo.innerHTML += `<div style="background:#2563eb; color:#fff; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-end; word-break:break-word;">${texto}</div>`;
            input.value = '';
            corpo.scrollTop = corpo.scrollHeight;

            setTimeout(() => {
                let txt = texto.toLowerCase();
                if (txt.includes('pagar') || txt.includes('conta') || txt.includes('aberto')) {
                    executarAcaoInteligente('contas_aberto');
                } else if (txt.includes('ir') || txt.includes('modulo') || txt.includes('navegar')) {
                    executarAcaoInteligente('ir_pagar');
                } else if (txt.includes('preencher') || txt.includes('dados') || txt.includes('automatizar')) {
                    executarAcaoInteligente('preencher_automatico');
                } else {
                    corpo.innerHTML += `<div style="background:#fff; border:1px solid #e2e8f0; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-start; line-height:1.5;">Para gerenciar esta rotina, posso levá-lo diretamente ao subsistema ou listar os dados em aberto. Utilize os botões rápidos acima para uma ação imediata!</div>`;
                    corpo.scrollTop = corpo.scrollHeight;
                }
            }, 500);
        }

        enviar.onclick = () => processarTextoLivre(input.value);
        input.onkeypress = (e) => { if (e.key === 'Enter') processarTextoLivre(input.value); };
    }

})();
