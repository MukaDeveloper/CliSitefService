import { IStartTransaction } from "../../interfaces";
import ContinueTransaction from "./continue-transaction.service";
import StartTransaction from "./start-transaction.service";

export class TefService {
  private startTransaction: StartTransaction;
  private continueTransaction: ContinueTransaction;

  constructor() {
    this.startTransaction = new StartTransaction();
    this.continueTransaction = new ContinueTransaction();
  }

  /**
   * 
   * @param data objeto enviado para iniciar a transação, interface IStartTransaction
   * @description Inicia a transação com parâmetros de configuração
   */
  async init(data: IStartTransaction): Promise<any> {
    const response = await this.startTransaction.execute(data);

    if (response?.sessionId) {
      const section = {
        sessionId: response.sessionId,
        continua: "0",
        cupomFiscal: data.taxInvoiceNumber,
        dataFiscal: data.taxInvoiceDate,
        horaFiscal: data.taxInvoiceTime,
        ret: [],
        functionalId: data.functionalId,
        functionalType: data.functionalType,
      };
      this.continueTransaction.transaction$ = this.startTransaction.transaction$;
      this.continueTransaction.section$ = section;
      await this.continue("");
      return response;
    } else {
      return new Error("Erro ao iniciar transação");
    }
  }

  /**
   * 
   * @param data Texto enviado para continuar a transação, normalmente vazio
   * @param section Informações da sessão.
   * @description Continua a transação com execução manual, com os parâmetros de sessão
   * utilizado em casos de questionamentos do agente para usuário.
   */
  async continue(data: string): Promise<any> {
    console.log("> continue", this.continueTransaction.section$);
    return await this.continueTransaction.execute(data);
  }

  /**
   * 
   * Método responsável por receber as respostas dos eventos
   * enviados pelos métodos de transação.
   */
  recieveStatus(callback: (status: string) => void) {
    this.startTransaction.listenStatus(callback);
    this.continueTransaction.listenStatus(callback);
  }

  /**
   * 
   * Método responsável por receber as respostas de transações aprovadas
   */
  onApproved(callback: () => void) {
    this.continueTransaction.getApproved(callback);
  }
}
