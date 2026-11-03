/* ============================================================
   Sacramento ERP — erp-saldos.js v1.1
   Cálculo ÚNICO dos saldos (usado por Contas Bancárias e Fluxo de Caixa).

   REGRA:
   1) Saldo total da empresa = entradas realizadas − saídas pagas (mesma regra do Fluxo de Caixa).
   2) Cartão pré-pago com recarga configurada (valor + dia do mês):
        saldo = valor da recarga − gastos pagos no cartão depois da última recarga.
   3) Conta principal (a única conta corrente disponível) = saldo total − cartões − demais contas.
   Contas sem regra automática continuam com o saldo informado manualmente.
   v1.1: empresa sem nenhum lançamento usa o saldo informado no cadastro (não calcula zero).
   O saldo digitado em cada conta serve de CONFERÊNCIA com o extrato.
   ============================================================ */
(function (w) {
    'use strict';

    function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    function numero(v) {
        if (typeof v === 'number') return v;
        var s = String(v === null || v === undefined ? '' : v).trim();
        if (!s) return 0;
        if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
        var n = parseFloat(s);
        return isNaN(n) ? 0 : n;
    }
    function arred(n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; }
    function dataISO(d) {
        if (!d) return '';
        var s = String(d).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
        var m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
        if (m) return m[3] + '-' + m[2] + '-' + m[1];
        return '';
    }
    function hojeISO() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    async function lerTudo(sb, tabela, cid) {
        var out = [], PAG = 1000;
        for (var ini = 0; ini < 200000; ini += PAG) {
            var r = await sb.from(tabela).select('*').eq('cliente_id', cid).order('id', { ascending: true }).range(ini, ini + PAG - 1);
            if (r.error) return { data: null, error: r.error };
            out.push.apply(out, r.data || []);
            if (!r.data || r.data.length < PAG) break;
        }
        return { data: out, error: null };
    }

    // ---------- movimentos realizados (REGRAS IDÊNTICAS às do Fluxo de Caixa) ----------
    async function carregarMovimentos(sb, cid) {
        var res = await Promise.all([lerTudo(sb, 'contas_receber', cid), lerTudo(sb, 'contas_pagar', cid), lerTudo(sb, 'transferencias', cid)]);
        var erro = res[0].error || res[1].error || res[2].error;
        if (erro) return { movs: [], ignorados: 0, erro: erro };
        var receber = res[0].data, pagar = res[1].data, transferencias = res[2].data;
        var movs = [], ignorados = 0;

        receber.forEach(function (r) {
            var st = norm(r.status);
            if (!(st.indexOf('recebido') >= 0 || st.indexOf('pago') >= 0 || st.indexOf('quitado') >= 0)) return;
            var d = dataISO(r.data_recebimento || r.vencimento || r.created_at);
            if (!d) return;
            movs.push({ id: 'r' + r.id, data: d, tipo: 'entrada', descricao: r.descricao || 'Recebimento',
                referencia: r.cliente_nome || r.cliente || '', centro: r.centro_custo || '', valor: numero(r.valor), conta: r.conta_destino || '' });
        });

        transferencias.forEach(function (t) {
            var d = dataISO(t.data || t.created_at);
            if (!d) return;
            var obs = norm(t.observacao);
            var origem = norm(t.conta_origem);
            if (obs.indexOf('ajuste de saldo') >= 0) {
                movs.push({ id: 't' + t.id, data: d, tipo: 'entrada', descricao: t.observacao || 'AJUSTE DE SALDO',
                    referencia: '', centro: t.centro_custo || '', valor: numero(t.valor), ajuste: true });
                return;
            }
            if (obs.indexOf('cartao') >= 0 || obs.indexOf('google') >= 0 || origem.indexOf('cartao') >= 0) return;
            var ehAporte = obs.indexOf('aporte') >= 0 || obs.indexOf('emprestimo') >= 0 || obs.indexOf('mutuo') >= 0 || obs.indexOf('inicial') >= 0 ||
                (obs.indexOf('pix recebido') >= 0 && obs.indexOf('fatura') < 0 && obs.indexOf('pagamento') < 0);
            if (!ehAporte) return;
            var quem = String(t.conta_origem || '').trim();
            movs.push({ id: 't' + t.id, data: d, tipo: 'entrada',
                descricao: (quem ? quem + ' — ' : '') + (t.observacao || 'Aporte / Capital Social'),
                referencia: t.conta_destino || '', centro: t.centro_custo || '', valor: numero(t.valor) });
        });

        pagar.forEach(function (p) {
            var st = norm(p.status);
            if (!(st.indexOf('pago') >= 0 || st.indexOf('quitado') >= 0)) return;
            var d = dataISO(p.data_pagamento || p.vencimento || p.created_at);
            if (!d) return;
            var desc = norm(p.descricao);
            var forn = norm(p.fornecedor_nome || p.fornecedor);
            if (desc.indexOf('favorecido') >= 0 || forn.indexOf('favorecido') >= 0) { ignorados++; return; }
            if (desc.indexOf('pagamento fatura cartao') >= 0 || desc.indexOf('reposicao do cartao') >= 0) { ignorados++; return; }
            movs.push({ id: 'p' + p.id, data: d, tipo: 'saida', descricao: p.descricao || 'Pagamento',
                referencia: p.fornecedor_nome || p.fornecedor || '', centro: p.centro_custo || '', valor: numero(p.valor), conta: p.conta_origem || '' });
        });

        movs.sort(function (a, b) { return a.data < b.data ? -1 : (a.data > b.data ? 1 : (a.tipo === b.tipo ? 0 : (a.tipo === 'entrada' ? -1 : 1))); });
        return { movs: movs, ignorados: ignorados, erro: null };
    }

    // ---------- classificação das contas (idêntica à do Fluxo) ----------
    function identificacao(cb) { return norm((cb.nome || '') + ' ' + (cb.banco || '') + ' ' + (cb.tipo || '')); }
    function entraNoSaldo(cb) {
        var titular = norm(cb.titularidade), ident = identificacao(cb);
        if (/\bpf\b/.test(titular) || titular.indexOf('fisica') >= 0 || titular.indexOf('pessoal') >= 0 || /\bpf\b/.test(ident) || ident.indexOf('pessoal') >= 0) return false;
        return norm(cb.classificacao_saldo || 'disponivel') === 'disponivel';
    }
    function ehCartao(cb) { return /cartao|pre-pago|prepago|pre pago/.test(identificacao(cb)); }
    function saldoInformado(cb) {
        return numero(cb.saldo_inicial !== undefined && cb.saldo_inicial !== null ? cb.saldo_inicial : (cb.saldo_atual !== undefined ? cb.saldo_atual : cb.saldo));
    }

    // data (AAAA-MM-DD) da última recarga ocorrida até 'hoje' (dia do mês fixo; meses curtos usam o último dia)
    function ultimaRecarga(hoje, dia) {
        var p = hoje.split('-').map(Number);
        function diaNoMes(a, m) { return Math.min(dia, new Date(a, m, 0).getDate()); }
        var a = p[0], m = p[1], d = diaNoMes(a, m);
        if (p[2] < d) { m -= 1; if (m < 1) { m = 12; a -= 1; } d = diaNoMes(a, m); }
        return a + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    }

    function casaConta(contaMov, cb, unicoCartao) {
        var c = norm(contaMov);
        if (!c) return false;
        var nome = norm(cb.nome || cb.banco);
        if (nome && (c === nome || c.indexOf(nome) >= 0)) return true;
        return unicoCartao && /cartao|pre-pago|prepago|pre pago/.test(c);
    }

    function calcular(contas, movs, hoje) {
        hoje = hoje || hojeISO();
        var total = 0;
        movs.forEach(function (m) { total += (m.tipo === 'entrada' ? m.valor : -m.valor); });
        total = arred(total);

        var itens = (contas || []).map(function (cb) {
            return { cb: cb, id: cb.id, nome: cb.nome || cb.banco || 'Conta', cartao: ehCartao(cb), disponivel: entraNoSaldo(cb),
                     informado: arred(saldoInformado(cb)), calculado: null, auto: false, nota: '' };
        });
        var disp = itens.filter(function (i) { return i.disponivel; });
        var cartoes = disp.filter(function (i) { return i.cartao; });
        var unicoCartao = cartoes.length === 1;

        cartoes.forEach(function (i) {
            var rv = numero(i.cb.recarga_valor), rd = parseInt(i.cb.recarga_dia, 10);
            if (rv > 0 && rd >= 1 && rd <= 31) {
                var ult = ultimaRecarga(hoje, rd);
                var gastos = 0;
                movs.forEach(function (m) { if (m.tipo === 'saida' && m.data > ult && casaConta(m.conta, i.cb, unicoCartao)) gastos += m.valor; });
                i.calculado = arred(rv - gastos);
                i.auto = true;
                i.nota = 'Recarga de ' + arred(rv).toFixed(2).replace('.', ',') + ' todo dia ' + rd + ' (última: ' + ult.split('-').reverse().join('/') + '); gastos no cartão desde então: ' + arred(gastos).toFixed(2).replace('.', ',');
            }
        });

        var naoCartao = disp.filter(function (i) { return !i.cartao; });
        var correntes = naoCartao.filter(function (i) { return /corrente/.test(norm(i.cb.tipo)); });
        var automatico = false;
        // Empresa SEM nenhum lançamento ainda (recém-cadastrada): não há o que calcular, vale o saldo informado no cadastro da conta.
        // Assim que houver lançamentos, volta a valer o cálculo automático (empresas com histórico não são afetadas).
        var semLancamentos = movs.length === 0;
        if (!semLancamentos && correntes.length === 1 && cartoes.every(function (i) { return i.auto; })) {
            var pr = correntes[0];
            var somaCartoes = cartoes.reduce(function (s, i) { return s + i.calculado; }, 0);
            var outros = naoCartao.filter(function (i) { return i !== pr; }).reduce(function (s, i) { return s + i.informado; }, 0);
            pr.calculado = arred(total - somaCartoes - outros);
            pr.auto = true;
            pr.nota = 'Saldo total pelos lançamentos menos o cartão e as demais contas';
            automatico = true;
        }

        var contasSaldo = 0, cartoesSaldo = 0, informadoTotal = 0;
        disp.forEach(function (i) {
            var v = (i.calculado !== null) ? i.calculado : i.informado;
            if (i.cartao) cartoesSaldo += v; else contasSaldo += v;
            informadoTotal += i.informado;
        });
        itens.forEach(function (i) { i.diferenca = (i.calculado !== null) ? arred(i.informado - i.calculado) : null; });

        return { total: total, contas: arred(contasSaldo), cartoes: arred(cartoesSaldo), patrimonio: arred(contasSaldo + cartoesSaldo),
                 informadoTotal: arred(informadoTotal), itens: itens, automatico: automatico, semLancamentos: semLancamentos };
    }

    w.ERPSaldos = { carregarMovimentos: carregarMovimentos, calcular: calcular, entraNoSaldo: entraNoSaldo, ehCartao: ehCartao, ultimaRecarga: ultimaRecarga };
})(window);
