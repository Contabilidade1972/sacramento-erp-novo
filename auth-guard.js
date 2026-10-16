/**
 * Sacramento ERP — Auth Guard, Blindagem Multi-Tenant (LGPD) & Assistente Contextual Interativo Pro
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
        const elUserName = document.getElementById('userName');
        if (elUserName) {
            elUserName.innerText = (usuario.nome || usuario.email || 'Utilizador').split('@')[0];
        }

        // ==========================================================
        // INJEÇÃO DO ASSISTENTE VIRTUAL INTERATIVO & CONTEXTUAL (PRO)
        // ==========================================================
        if (!paginaAtual.includes('central_ajuda.html')) {
            injetarAssistenteInterativoPro(paginaAtual);
        }

        // BLINDAGEM VISUAL LGPD: Se NÃO foi Master, oculta seletores de empresa
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

    // 4. Validação de Inadimplência e Licença via Supabase
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
    // MOTOR DO ASSISTENTE VIRTUAL INTERATIVO (CONTEXTUAL POR PÁGINA)
    // ==========================================================
    function injetarAssistenteInterativoPro(pagina) {
        if (document.getElementById('containerAssistenteInterativo')) return;

        // Base de conhecimento detalhada com orientações exatas por página
        const baseContextos = {
            'contas_pagar.html': {
                titulo: 'Assistente: Contas a Pagar',
                saudacao: 'Olá! Estou a monitorar a sua tela de Contas a Pagar. Como posso ajudar com este lançamento ou fornecedor?',
                sugestoesRapidas: [
                    'Como preencher o fornecedor?',
                    'Qual a importância do Centro de Custo?',
                    'O que acontece se atrasar o título?'
                ],
                respostasDinamicas: {
                    'fornecedor': 'Digite o CNPJ no campo correspondente; o sistema consome a BrasilAPI para preencher razão social e endereço automaticamente. Nunca pague despesas sem documento fiscal válido.',
                    'centro de custo': 'O Centro de Custo é obrigatório para direcionar a despesa na DRE gerencial e apurar a rentabilidade correta dos seus projetos.',
                    'atrasar': 'Atrasos geram multas e juros contratuais não provisionados, além de impactar negativamente o fluxo de caixa projetado e o rating com fornecedores.'
                }
            },
            'contas_receber.html': {
                titulo: 'Assistente: Contas a Receber',
                saudacao: 'Olá! Estou a auxiliar no Contas a Receber. Tem dúvidas sobre faturas, prazos ou inadimplência?',
                sugestoesRapidas: [
                    'Como registrar um recebimento?',
                    'Como gerenciar títulos vencidos?',
                    'Qual o impacto no fluxo de caixa?'
                ],
                respostasDinamicas: {
                    'recebimento': 'Selecione o título em aberto, confira o valor líquido e clique em dar baixa informando a conta bancária de destino.',
                    'vencidos': 'Títulos vencidos aparecem destacados em vermelho no painel. Acione o setor comercial para régua de cobrança preventiva.',
                    'fluxo de caixa': 'O recebimento pontual garante liquidez para honrar os compromissos de folha e fornecedores sem recorrer a empréstimos bancários.'
                }
            },
            'cte.html': {
                titulo: 'Assistente: Emissão de CT-e',
                saudacao: 'Olá! Posso auxiliar na emissão do Conhecimento de Transporte Eletrônico e validação SEFAZ?',
                sugestoesRapidas: [
                    'Como importar o XML da NF-e?',
                    'Quais os cuidados com a ANTT?',
                    'Como emitir o DACTE?'
                ],
                respostasDinamicas: {
                    'xml': 'Clique na área de upload de XML para extrair automaticamente remetente, destinatário, peso e valores da mercadoria.',
                    'antt': 'Certifique-se de que o RNTRC da frota e do motorista estão regulares para evitar apreensão do veículo em barreiras fiscais.',
                    'dacte': 'Após a autorização da SEFAZ, o botão de impressão do DACTE em formato A4 retrato fica liberado na tabela.'
                }
            },
            'parceiros.html': {
                titulo: 'Assistente: Gestão de Parceiros',
                saudacao: 'Olá! Estou a acompanhar o diretório de parceiros e a conformidade com a LGPD.',
                sugestoesRapidas: [
                    'Como funciona a consulta por CNPJ?',
                    'Os dados estão seguros (LGPD)?',
                    'Posso cadastrar fornecedores?'
                ],
                respostasDinamicas: {
                    'cnpj': 'Basta digitar o CNPJ com 14 dígitos e o sistema preenche os dados oficiais da Receita Federal em segundos.',
                    'lgpd': 'Sim! O ERP possui blindagem Multi-Tenant estrita. Os dados cadastrais pertencem exclusivamente à sua empresa (`cliente_id`) e não são compartilhados.',
                    'fornecedores': 'Sim, o mesmo diretório centraliza clientes, fornecedores e parceiros de negócio.'
                }
            }
        };

        const contextoPadrao = {
            titulo: 'Assistente Inteligente Sacramento ERP',
            saudacao: `Olá! Estou a auxiliar no ecrã atual. Como posso ajudar com preenchimentos, regras de negócio ou conformidade fiscal?`,
            sugestoesRapidas: [
                'Para que serve este módulo?',
                'Quais os campos obrigatórios?',
                'Como consultar a Central de Ajuda?'
            ],
            respostasDinamicas: {
                'modulo': 'Este módulo faz parte do ecossistema de alta performance do Sacramento ERP, com total isolamento multi-tenant e segurança jurídica.',
                'obrigatorios': 'Preencha sempre os campos sinalizados com asterisco (*). O sistema valida automaticamente dados de CNPJ e valores.',
                'central': 'Clique no link de manuais no cabeçalho ou digite na barra de busca superior para localizar tutoriais detalhados.'
            }
        };

        const ctx = baseContextos[pagina] || contextoPadrao;

        // Criação do Elemento HTML do Chat Flutuante Interativo
        const container = document.createElement('div');
        container.id = 'containerAssistenteInterativo';
        container.innerHTML = `
            <div id="painelChatInterativo" style="display:none; position:fixed; bottom:90px; right:24px; width:360px; background:#fff; border-radius:16px; box-shadow:0 20px 50px rgba(15,23,42,0.3); border:1px solid #cbd5e1; z-index:999998; overflow:hidden; font-family:'Inter',sans-serif; display:none; flex-direction:column;">
                <div style="background:#1e3a8a; color:#fff; padding:14px 18px; display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:13.5px; display:flex; align-items:center; gap:8px;"><i class="fas fa-robot" style="color:#60a5fa;"></i> ${ctx.titulo}</strong>
                    <button id="fecharChatInterativo" style="background:none; border:none; color:#cbd5e1; font-size:16px; cursor:pointer;"><i class="fas fa-times"></i></button>
                </div>
                <div id="corpoChatInterativo" style="padding:16px; height:280px; overflow-y:auto; display:flex; flex-direction:column; gap:12px; background:#f8fafc; font-size:12.5px; color:#334155;">
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-start; box-shadow:0 2px 5px rgba(0,0,0,0.02); line-height:1.5;">
                        ${ctx.saudacao}
                    </div>
                </div>
                <div style="padding:10px 14px; background:#fff; border-top:1px solid #e2e8f0; display:flex; gap:6px; flex-wrap:wrap;" id="sugestoesRapidasBox">
                    ${ctx.sugestoesRapidas.map(s => `<button class="sugestao-pill" style="background:#eff6ff; border:1px solid #bfdbfe; color:#1d4ed8; padding:5px 10px; border-radius:12px; font-size:11px; cursor:pointer; font-weight:600; transition:0.15s;">\${s}</button>`).join('')}
                </div>
                <div style="padding:12px 14px; background:#fff; border-top:1px solid #e2e8f0; display:flex; gap:8px;">
                    <input type="text" id="inputChatInterativo" placeholder="Digite sua dúvida sobre esta página..." style="flex:1; height:38px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; font-size:12.5px; outline:none;">
                    <button id="enviarChatInterativo" style="background:#2563eb; color:#fff; border:none; width:38px; height:38px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center;"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
            <button id="btnDisparadorInterativo" title="Assistente Interativo Sacramento ERP" style="position:fixed; bottom:24px; right:24px; z-index:999999; width:54px; height:54px; border-radius:50%; background:#2563eb; color:#fff; border:none; font-size:22px; cursor:pointer; box-shadow:0 6px 20px rgba(37,99,235,0.45); display:flex; align-items:center; justify-content:center; transition:all 0.2s ease;">
                <i class="fas fa-robot"></i>
            </button>
        `;

        document.body.appendChild(container);

        const btn = document.getElementById('btnDisparadorInterativo');
        const painel = document.getElementById('painelChatInterativo');
        const fechar = document.getElementById('fecharChatInterativo');
        const input = document.getElementById('inputChatInterativo');
        const enviar = document.getElementById('enviarChatInterativo');
        const corpo = document.getElementById('corpoChatInterativo');

        btn.onclick = () => {
            painel.style.display = painel.style.display === 'flex' ? 'none' : 'flex';
        };
        fechar.onclick = () => { painel.style.display = 'none'; };
        btn.onmouseover = () => { btn.style.background = '#1d4ed8'; btn.style.transform = 'scale(1.08)'; };
        btn.onmouseout = () => { btn.style.background = '#2563eb'; btn.style.transform = 'scale(1)'; };

        function processarMensagem(texto) {
            if (!texto.trim()) return;
            
            // Adiciona mensagem do utilizador
            corpo.innerHTML += `<div style="background:#2563eb; color:#fff; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-end; word-break:break-word;">${texto}</div>`;
            input.value = '';
            corpo.scrollTop = corpo.scrollHeight;

            setTimeout(() => {
                let resposta = "Compreendi a sua dúvida. Para este campo, certifique-se de seguir o padrão nacional de preenchimento e manter os dados fiscais rigorosamente atualizados.";
                
                const tLower = texto.toLowerCase();
                for (let chave in ctx.respostasDinamicas) {
                    if (tLower.includes(chave)) {
                        resposta = ctx.respostasDinamicas[chave];
                        break;
                    }
                }

                corpo.innerHTML += `<div style="background:#fff; border:1px solid #e2e8f0; padding:10px 14px; border-radius:10px; max-width:90%; align-self:flex-start; box-shadow:0 2px 5px rgba(0,0,0,0.02); line-height:1.5;">${resposta}</div>`;
                corpo.scrollTop = corpo.scrollHeight;
            }, 500);
        }

        enviar.onclick = () => processarMensagem(input.value);
        input.onkeypress = (e) => { if (e.key === 'Enter') processarMensagem(input.value); };

        document.querySelectorAll('.sugestao-pill').forEach(pill => {
            pill.onclick = () => processarMensagem(pill.innerText);
        });
    }

})();
