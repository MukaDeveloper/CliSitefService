const EventEmitter = require('events');
import { IContinueTransaction, IStartTransaction } from "../../interfaces";
import { BaseService } from "../../shared/base";
import ContinueTransaction from "./continue-transaction.service";
import StartTransaction from "./start-transaction.service";

export class TefService {
  private eventEmitter: typeof EventEmitter;
  private baseService: BaseService;

  constructor() {
    this.baseService = new BaseService();
    this.eventEmitter = new EventEmitter();
  }

  /**
   * @param data objeto enviado para iniciar a transação, interface IStartTransaction
   * @description Inicia a transação com parâmetros de configuração
   */
  init(data: IStartTransaction): any {
    const start = new StartTransaction();
    return start.execute(data);
  }

  continue(data: IContinueTransaction): any {
    const continueTransaction = new ContinueTransaction();
    return continueTransaction.execute(data);
  }

  test() {
    setTimeout(() => {
      this.baseService.sendEmitter(0, 'Teste');
    }, 1000);
  }

  /**
   * Método responsável por receber as respostas dos eventos
   * enviados pelos métodos de transação.
   */
  listenResponses(callback: (res: any) => void): void {
    this.eventEmitter.on('transaction', callback);
  }
}
