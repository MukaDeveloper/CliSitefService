import {
  ISendStatus,
  IStartTransaction,
  IStartTransactionResponse,
} from "../interfaces";
import { IFinishTransaction } from "../interfaces/i-finish-transaction";
import GetState from "./state/get-state.service";
import ContinueTransaction from "./transaction/continue-transaction.service";
import FinishTransaction from "./transaction/finish-transaction.service";
import StartTransaction from "./transaction/start-transaction.service";

export class TefService {
  // #region Properties (3)

  private continueTransaction: ContinueTransaction;
  private finishTransaction: FinishTransaction;
  private getStateService: GetState;
  private startTransaction: StartTransaction;

  // #endregion Properties (3)

  // #region Constructors (1)

  constructor() {
    this.getStateService = new GetState();
    this.startTransaction = new StartTransaction();
    this.continueTransaction = new ContinueTransaction();
    this.finishTransaction = new FinishTransaction();
  }

  // #endregion Constructors (1)

  // #region Estágios (5)

  /**
   *
   * @param data Texto enviado para continuar a transação, normalmente vazio
   * @description Continua com a transação
   */
  public async continue(data: string, requestCancel: boolean | null = null): Promise<unknown> {
    return await this.continueTransaction.execute(data, requestCancel);
  }

  public async cancel(cancel: boolean) {
    if (cancel === true) {
      return await this.continue('0');
    } else {
      return await this.continue(`1`);
    }
  }

  public async finish(data: IFinishTransaction) {
    return await this.finishTransaction.execute(data);
  }

  /**
   * 
   * @returns Retorna o estado atual do agente
   */
  public async getState() {
    return await this.getStateService.execute();
  }

  /**
   *
   * @param data objeto enviado para iniciar a transação, interface IStartTransaction
   * @description Inicia a transação com parâmetros de configuração
   */
  public async init(
    data: IStartTransaction,
  ): Promise<IStartTransactionResponse | void> {
    const state = await this.getState();
    console.log("Estado do agente:", state);

    try {
      switch (state?.serviceState) {
        case 0:
          throw new Error("Agente não inicializado");
        case 2:
        case 3:
          throw new Error("Já existe uma transação iniciada ou em andamento");
        case 4:
          await this.continueTransaction.sendFinished();
          break;
      }

      const response = await this.startTransaction.execute(data);

      if (response?.clisitefStatus === 10000) {
        const section = {
          sessionId: response?.sessionId,
          continue: "0",
          cupomFiscal: data.taxInvoiceNumber,
          dataFiscal: data.taxInvoiceDate,
          horaFiscal: data.taxInvoiceTime,
          ret: [],
          functionalId: data.functionalId,
          functionalType: data.functionalType,
        };

        /**
         * Alimenta as variáveis da instância continue.
         */
        this.continueTransaction.transaction$ = data
        this.continueTransaction.section$ = section;

        /**
         * Continua com a transação.
         */
        await this.continue("");
        return response;
      } else {
        throw new Error("Erro ao iniciar transação");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        serviceStatus: 1,
        serviceMessage: error?.message,
        clisitefStatus: 0,
      };
    }
  }

  // #endregion Estágios (5)

  // #region Listeners

  /**
   *
   * Método responsável por receber as respostas de transações aprovadas
   */
  public onApproved(callback: () => void) {
    this.continueTransaction.getApproved(callback);
  }

  /**
   *
   * Método responsável por receber as respostas dos eventos
   * enviados pelos métodos de transação.
   */
  public recieveStatus(callback: (status: ISendStatus) => void) {
    const pong = (status: ISendStatus) => {
      if (
        this.continueTransaction.message$ === null ||
        this.continueTransaction.message$ !== status
      ) {
        this.continueTransaction.message$ = status;
        callback(status);
      }
    };
    this.startTransaction.listenStatus(pong);
    this.continueTransaction.listenStatus(pong);
  }

  public recieveLogs(callback: (status: ISendStatus) => void) {
    const pong = (status: ISendStatus) => {
      if (
        this.continueTransaction.message$ === null ||
        this.continueTransaction.message$ !== status
      ) {
        this.continueTransaction.message$ = status;
        callback(status);
      }
    };
    this.continueTransaction.listenLogs(pong);
  }

  public recieveQuestion(callback: (status: ISendStatus) => void) {
    const pong = (status: ISendStatus) => {
      if (
        this.continueTransaction.message$ === null ||
        this.continueTransaction.message$ !== status
      ) {
        this.continueTransaction.message$ = status;
        callback(status);
      }
    };
    this.continueTransaction.listenQuestion(pong);
  }

  // #endregion Listeners
}
