import { IStartTransaction } from "../../interfaces";
import { BaseService } from "../../shared/base";
import ContinueTransaction from "./continue-transaction.service";
import StartTransaction from "./start-transaction.service";

export class TefService {
  private baseService: BaseService;
  private startTransaction: StartTransaction;
  private continueTransaction: ContinueTransaction;

  constructor() {
    this.baseService = new BaseService();
    this.startTransaction = new StartTransaction();
    this.continueTransaction = new ContinueTransaction();
  }

  /**
   * 
   * @param data objeto enviado para iniciar a transação, interface IStartTransaction
   * @description Inicia a transação com parâmetros de configuração
   */
  async init(data: IStartTransaction): Promise<any> {
    return await this.startTransaction.execute(data);
  }

  /**
   * 
   * @param data Texto enviado para continuar a transação, normalmente vazio
   * @param section Informações da sessão.
   * @description Continua a transação com execução manual, com os parâmetros de sessão
   * utilizado em casos de questionamentos do agente para usuário.
   */
  async continue(data: string, section: any): Promise<any> {
    return await this.continueTransaction.execute(data, section);
  }

  /**
   * 
   * Método responsável por receber as respostas dos eventos
   * enviados pelos métodos de transação.
   */
  async recieveMessages(callback: (res: any) => void): Promise<void> {
    await this.baseService.onSendStatus(callback);
  }
}
