import { IStartTransaction } from "../../interfaces";
import { BaseService } from "../../shared/base";
import StartTransaction from "./start-transaction.service";

export class TefService {
  private baseService: BaseService;

  constructor() {
    this.baseService = new BaseService();
  }

  /**
   * @param data objeto enviado para iniciar a transação, interface IStartTransaction
   * @description Inicia a transação com parâmetros de configuração
   */
  init(data: IStartTransaction): any {
    const start = new StartTransaction();
    return start.execute(data);
  }

  /**
   * Método responsável por receber as respostas dos eventos
   * enviados pelos métodos de transação.
   */
  recieveMessages(callback: (res: any) => void): void {
    this.baseService.onSendStatus(callback);
  }
}
