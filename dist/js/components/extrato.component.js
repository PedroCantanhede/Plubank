import Conta from "../types/Conta.js";
import { FormatoData } from "../types/FormatoData.js";
import { TipoTransacao } from "../types/TipoTransacao.js";
import { formatarMoeda, formatarData } from "../utils/formatters.js";
const elementoRegistroTransacoesExtrato = document.querySelector(".extrato .registro-transacoes");
renderizarExtrato();
function renderizarExtrato() {
    const gruposTransacoes = Conta.getGruposTransacoes();
    elementoRegistroTransacoesExtrato.innerHTML = "";
    let htmlRegistroTransacoes = "";
    for (let grupoTransacao of gruposTransacoes) {
        let htmlTransacaoItem = "";
        for (let transacao of grupoTransacao.transacoes) {
            const classeTransacao = transacao.tipoTransacao === TipoTransacao.DEPOSITO
                ? "deposito"
                : "saida"; // Para Transferência e Pagamento de Boleto, considera como "saida"
            htmlTransacaoItem += `
                <div class="transacao-item ${classeTransacao}"> <!-- A classe foi adicionada aqui -->
                    <div class="transacao-info">
                        <span class="tipo">${transacao.tipoTransacao}</span>
                        <strong class="valor">${formatarMoeda(transacao.valor)}</strong>
                    </div>
                    <time class="data">${formatarData(transacao.data, FormatoData.DIA_MES)}</time>
                </div>
            `;
        }
        htmlRegistroTransacoes += `
            <div class="transacoes-group">
                <strong class="mes-group">${grupoTransacao.label}</strong>
                ${htmlTransacaoItem}
            </div>
        `;
    }
    if (htmlRegistroTransacoes === "") {
        htmlRegistroTransacoes = "<div>Não há transações registradas.</div>";
    }
    elementoRegistroTransacoesExtrato.innerHTML = htmlRegistroTransacoes;
}
const ExtratoComponent = {
    atualizar() {
        renderizarExtrato();
    }
};
export default ExtratoComponent;
