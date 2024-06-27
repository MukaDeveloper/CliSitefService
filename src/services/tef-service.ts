import {
  IContinueTransaction,
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
  private getState: GetState;
  private startTransaction: StartTransaction;

  // #endregion Properties (3)

  // #region Constructors (1)

  constructor() {
    this.getState = new GetState();
    this.startTransaction = new StartTransaction();
    this.continueTransaction = new ContinueTransaction();
    this.finishTransaction = new FinishTransaction();
  }

  // #endregion Constructors (1)

  // #region Public Methods (4)

  /**
   *
   * @param data Texto enviado para continuar a transação, normalmente vazio
   * @description Continua com a transação
   */
  public async continue(data: string, cancel: boolean = false): Promise<unknown> {
    return await this.continueTransaction.execute(data, cancel);
  }

  public async finish(data: IFinishTransaction) {
    return await this.finishTransaction.execute(data);
  }

  /**
   *
   * @param data objeto enviado para iniciar a transação, interface IStartTransaction
   * @description Inicia a transação com parâmetros de configuração
   */
  public async init(
    data: IStartTransaction,
    newTransaction: boolean
  ): Promise<IStartTransactionResponse | void> {
    const state = await this.getState.execute();

    console.log("Estado do agente:", state);

    try {
      if (state?.serviceState === 0) {
        console.error("Agente não inicializado");
        return;
      }
      switch (state?.serviceState) {
        case 0:
          console.error("Agente não inicializado");
          return;
        case 2:
        case 3:
          console.log("Há uma transação iniciada ou em andamento.");
          if (newTransaction === true) {
            this.continueTransaction.section$ = {
              sessionId: state?.sessionId,
              continue: "-1",
              data: "",
            } as IContinueTransaction;
          }
          await this.continue("");
          break;
        case 4:
          // FinishTransaction;
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

  // #endregion Public Methods (4)
}
