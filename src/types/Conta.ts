import { Armazenador } from "./Armazenador.js";
import { ValidaDebito, ValidaDeposito } from "./Decorators.js";
import { GrupoTransacao } from "./GrupoTransacao.js";
import { TipoTransacao } from "./TipoTransacao.js";
import { Transacao } from "./Transacao.js";

export class Conta {
    static getDataAcesso(): Date {
        throw new Error("Method not implemented.");
    }
    static getSaldo(): number {
        throw new Error("Method not implemented.");
    }
    static getGruposTransacoes(): GrupoTransacao[] {
        throw new Error("Method not implemented.");
    }
    protected nome: string;
    protected saldo: number = Armazenador.obter<number>("saldo") || 0; // Carrega saldo do localStorage ou inicia com 0
    private transacoes: Transacao[] = Armazenador.obter<Transacao[]>("transacoes", (key, value) => {
        if (key === "data") {
            return new Date(value); // Garante que as datas sejam objetos Date
        }
        return value;
    }) || []; // Carrega transações do localStorage ou inicia vazio

    constructor(nome: string) {
        this.nome = nome;
    }
    public getTitular() {
        return this.nome
    }
    getGruposTransacoes(): GrupoTransacao[] {
        const gruposTransacoes: GrupoTransacao[] = [];
        const listaTransacoes: Transacao[] = structuredClone(this.transacoes);
        const transacoesOrdenadas: Transacao[] = listaTransacoes.sort((t1, t2) => t2.data.getTime() - t1.data.getTime());
        let labelAtualGrupoTransacao: string = "";

        for (let transacao of transacoesOrdenadas) {
            let labelGrupoTransacao: string = transacao.data.toLocaleDateString("pt-br", { month: "long", year: "numeric" });
            if (labelAtualGrupoTransacao !== labelGrupoTransacao) {
                labelAtualGrupoTransacao = labelGrupoTransacao;
                gruposTransacoes.push({
                    label: labelGrupoTransacao,
                    transacoes: []
                });
            }
            gruposTransacoes.at(-1).transacoes.push(transacao);
        }

        return gruposTransacoes;
    }

    getSaldo() {
        return this.saldo;
    }
    getDataAcesso(): Date {
        return new Date();
    }
    registrarTransacao(novaTransacao: Transacao): void {
        if (novaTransacao.tipoTransacao === TipoTransacao.DEPOSITO) {
            this.depositar(novaTransacao.valor);
        } else if (novaTransacao.tipoTransacao === TipoTransacao.TRANSFERENCIA || novaTransacao.tipoTransacao === TipoTransacao.PAGAMENTO_BOLETO) {
            this.debitar(novaTransacao.valor);
            novaTransacao.valor *= -1; // Valor negativo para saídas
        } else {
            throw new Error("Tipo de Transação inválido!");
        }
    
        this.transacoes.push(novaTransacao);
        Armazenador.salvar("transacoes", this.transacoes); // Se certifica de salvar as transações como array
        Armazenador.salvar("saldo", this.saldo); // Salva o saldo atualizado também
    }
    @ValidaDebito
    debitar(valor: number): void {
        this.saldo -= valor;
        Armazenador.salvar("saldo", this.saldo.toString());
    }
    @ValidaDeposito
    depositar(valor: number): void {
        this.saldo += valor;
        Armazenador.salvar("saldo", this.saldo.toString());
    }
}

export class ContaPremium extends Conta {
    registrarTransacao(transacao: Transacao): void {
        if (transacao.tipoTransacao === TipoTransacao.DEPOSITO) {
            console.log('ganhou um bônus de 0.50 centavos')
            transacao.valor = transacao.valor += 0.5
        }
        super.registrarTransacao(transacao)
    }
}

const conta = new Conta("Joana da Silva Olveira");
const contaPremium = new ContaPremium("Mônica Hillman")

export default conta;