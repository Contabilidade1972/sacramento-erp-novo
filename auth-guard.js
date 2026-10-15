/**
 * Sacramento ERP — Auth Guard, Blindagem Multi-Tenant (LGPD) & Assistente Contextual Global
 */

(async function () {
    const EMAIL_MASTER = "lucianojorgesacramento@gmail.com";
    const paginaAtual = window.location.pathname.split("/").pop().toLowerCase();

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
        localStorage.setItem('empresaSelecionada', String(usuario.cliente_id));
    }

    // 3. Execução automática ao carregar o conteúdo da página (DOM)
    window.addEventListener('DOMContentLoaded', async () => {
        // Exibe o nome correto do utilizador no cabeçalho
        const elUserName = document.getElementById('userName');
        if (elUserName) {
            elUserName.innerText = (usuario.nome || usuario.email || 'Utilizador').split('@')[0];
        }

        // ==========================================================
        // INJEÇÃO DO ASSISTENTE CONTEXTUAL INTELIGENTE (EM TODAS AS SUBPÁGINAS)
        // ==========================================================
        if (!paginaAtual.includes('central_ajuda.html')) {
            injetarAssistenteContextual(paginaAtual);
        }

        // BLINDAGEM VISUAL LGPD: Se NÃO for o Master, oculta e destrói qualquer seletor de empresas do cabeçalho
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

    // ==========================================================
    // MOTOR DO ASSISTENTE CONTEXTUAL INTELIGENTE
    // ==========================================================
    function injetarAssistenteContextual(pagina) {
        if (document.getElementById('containerAssistenteContextual')) return;

        // Base de conhecimento detalhada por página do ERP
        const baseConhecimento = {
            'cte.html': {
                titulo: 'Guia Inteligente: CT-e (Transporte)',
                descricao: 'Emissão e escrituração de Conhecimento de Transporte Eletrônico conforme SEFAZ.',
                sugestoes: [
                    '💡 **Importação de XML:** Clique na zona de upload para carregar o XML da NF-e vinculada e preencher os dados instantaneamente.',
                    '🔍 **Validação de CNPJ:** Utilize a lupa no campo Remetente/Destinatário para buscar os dados direto na Receita Federal.',
                    '⚖️ **Pesos e Valores:** Certifique-se de informar o peso bruto em KG e o valor total do frete antes de autorizar.'
                ]
            },
            'parceiros.html': {
                titulo: 'Guia Inteligente: Parceiros & Clientes',
                descricao: 'Diretório unificado de clientes, fornecedores e prestadores.',
                sugestoes: [
                    '⚡ **Preenchimento Automático:** Digite o CNPJ ou CPF com 14/11 dígitos para puxar os dados da BrasilAPI automaticamente.',
                    '🏷️ **Centro de Custo:** É obrigatório associar um Centro de Custo para garantir a rastreabilidade contábil.',
                    '🛡️ **Segurança LGPD:** Os dados dos parceiros são restritos estritamente à empresa logada (Multi-Tenant).'
                ]
            },
            'produtos.html': {
                titulo: 'Guia Inteligente: Produtos e Serviços',
                descricao: 'Gestão de catálogo, custos, preços de venda e código de barras.',
                sugestoes: [
                    'barcode **Código de Barras:** Bipe o código EAN no campo correspondente para consultar a base global de produtos.',
                    '📊 **Margem de Lucro:** Preencha o preço de custo e o preço de venda para manter o DRE atualizado.',
                    '🏷️ **Etiquetas:** O sistema gera o gráfico do código de barras (JsBarcode) automaticamente na tabela.'
                ]
            },
            'contas_pagar.html': {
                titulo: 'Guia Inteligente: Contas a Pagar',
                descricao: 'Controle de despesas, vencimentos e baixas de títulos.',
                sugestoes: [
                    '📅 **Vencimentos:** Mantenha a data correta para alimentar o fluxo de caixa preventivo.',
                    '🏦 **Baixa de Títulos:** Ao pagar o fornecedor, registre a baixa para debitar o saldo da conta bancária.',
                    '📋 **Centro de Custo:** Indique o departamento ou projeto responsável pela despesa.'
                ]
            },
            'contas_receber.html': {
                titulo: 'Guia Inteligente: Contas a Receber',
                descricao: 'Gestão de receitas, faturamento e cobranças.',
                sugestoes: [
                    '💰 **Valores e Juros:** Informe o valor líquido acordado com o cliente.',
                    '✅ **Conciliação:** Confirme o recebimento assim que o montante aparecer no extrato bancário.',
                    '📊 **Inadimplência:** Títulos vencidos aparecem destacados em alertas executivos.'
                ]
            }
        };

        // Guia padrão caso a página não esteja na base detalhada
        const guiaPadrao = {
            titulo: 'Assistente Inteligente Sacramento ERP',
            descricao: 'Orientações operacionais para o ecrã atual.',
            sugestoes: [
                '📌 **Navegação Segura:** Utilize o menu lateral ou a pesquisa global para alternar entre módulos.',
                '🔒 **Conformidade LGPD:** Suas operações são criptografadas e isoladas por empresa.',
                '❓ **Suporte Completo:** Clique no balão abaixo a qualquer momento para abrir a Central de Ajuda com os manuais detalhados.'
            ]
        };

        const info = baseConhecimento[pagina] || guiaPadrao;

        // Criação visual do Widget Flutuante
        const container = document.createElement('div');
        container.id = 'containerAssistenteContextual';
        container.innerHTML = `
            <div id="painelAjudaContextual" style="display:none; position:fixed; bottom:90px; right:24px; width:340px; background:#fff; border-radius:14px; box-shadow:0 15px 40px rgba(15,23,42,0.25); border:1px solid #cbd5e1; z-index:999998; overflow:hidden; font-family:'Inter',sans-serif;">
                <div style="background:#1e3a8a; color:#fff; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:13.5px; display:flex; align-items:center; gap:8px;"><i class="fas fa-robot" style="color:#60a5fa;"></i> ${info.titulo}</strong>
                    <button onclick="document.getElementById('painelAjudaContextual').style.display='none'" style="background:none; border:none; color:#cbd5e1; font-size:16px; cursor:pointer;"><i class="fas fa-times"></i></button>
                </div>
                <div style="padding:16px; max-height:300px; overflow-y:auto; font-size:12.5px; color:#334155; line-height:1.5;">
                    <p style="font-weight:600; color:#1e293b; margin-bottom:10px;">${info.descricao}</p>
                    <ul style="padding-left:16px; display:flex; flex-direction:column; gap:8px;">
                        ${info.sugestoes.map(s => `<li>\${s}</li>`).join('')}
                    </ul>
                </div>
                <div style="padding:10px 16px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; font-size:11.5px;">
                    <span style="color:#64748b;">Precisa de mais detalhes?</span>
                    <a href="central_ajuda.html" style="color:#2563eb; font-weight:700; text-decoration:none;"><i class="fas fa-book"></i> Ver Manual Completo</a>
                </div>
            </div>
            <button id="btnBotaoAjudaContextual" title="Assistente Inteligente & Ajuda" style="position:fixed; bottom:24px; right:24px; z-index:999999; width:52px; height:52px; border-radius:50%; background:#2563eb; color:#fff; border:none; font-size:22px; cursor:pointer; box-shadow:0 6px 20px rgba(37,99,235,0.45); display:flex; align-items:center; justify-content:center; transition:all 0.2s ease;">
                <i class="fas fa-question"></i>
            </button>
        `;

        document.body.appendChild(container);

        // Comportamento do Botão (Alterna entre abrir o painel de dicas ou ir para a Central de Ajuda com duplo clique)
        const btn = document.getElementById('btnBotaoAjudaContextual');
        const painel = document.getElementById('painelAjudaContextual');

        btn.onclick = () => {
            painel.style.display = painel.style.display === 'block' ? 'none' : 'block';
        };
        btn.onmouseover = () => { btn.style.background = '#1d4ed8'; btn.style.transform = 'scale(1.08)'; };
        btn.onmouseout = () => { btn.style.background = '#2563eb'; btn.style.transform = 'scale(1)'; };
    }

})();
