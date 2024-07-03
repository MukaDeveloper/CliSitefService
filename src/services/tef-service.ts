import {
  ISendStatus,
  IStartTransaction,
  IStartTransactionResponse,
} from "../interfaces";
import { IFinishTransaction } from "../interfaces/i-finish-transaction";
import GetState from "./general/get-state.service";
import GetVersion from "./general/get-version.service";
import ClosePinpad from "./pinpad/close-pinpad.service";
import IsPresentPinpad from "./pinpad/is-present-pinpad.service";
import OpenPinpad from "./pinpad/open-pinpad.service";
import ReadYesNoPinpad from "./pinpad/read-yes-no-pinpad.service";
import SetDisplayMessagePinpad from "./pinpad/set-display-message-pinpad.service";
import CreateSession from "./session/create-session.service";
import ContinueTransaction from "./transaction/continue-transaction.service";
import FinishTransaction from "./transaction/finish-transaction.service";
import StartTransaction from "./transaction/start-transaction.service";

export class TefInstance {
  // #region Properties (3)

  public sessionId$: string | null = null;
  private startTransaction: StartTransaction;
  private continueTransaction: ContinueTransaction;
  private finishTransaction: FinishTransaction;
  private createSessionService: CreateSession;
  private openPinpadService: OpenPinpad;
  private closePinpadService: ClosePinpad;
  private isPresentPinpadService: IsPresentPinpad;
  private readYesNoPinpadService: ReadYesNoPinpad;
  private setDisplayMessagePinpadService: SetDisplayMessagePinpad;
  private getVersionService: GetVersion;
  private getStateService: GetState;
  private toCancel = false;

  // #endregion Properties (3)

  // #region Constructors (1)

  constructor() {
    this.getStateService = new GetState();
    this.getVersionService = new GetVersion();
    this.createSessionService = new CreateSession();
    this.openPinpadService = new OpenPinpad();
    this.closePinpadService = new ClosePinpad();
    this.isPresentPinpadService = new IsPresentPinpad();
    this.readYesNoPinpadService = new ReadYesNoPinpad();
    this.setDisplayMessagePinpadService = new SetDisplayMessagePinpad();
    this.startTransaction = new StartTransaction();
    this.continueTransaction = new ContinueTransaction();
    this.finishTransaction = new FinishTransaction();
  }

  // #endregion Constructors (1)

  // #region Estágios (5)

  /**
   *
   * @param data objeto enviado para iniciar a transação, interface IStartTransaction
   * @description Inicia a transação com parâmetros de configuração
   */
  public async start(
    data: IStartTransaction
  ): Promise<IStartTransactionResponse | void> {
    const state = await this.getState();
    try {
      switch (state?.serviceState) {
        case 0:
          return this.startTransaction.sendStatus(-1, "Agente não inicializado");
        case 2:
        case 3:
          return this.startTransaction.sendQuestion(state?.serviceState, "Já existe uma transação iniciada ou em andamento.\n1:Continuar;\n2:Cancelar");
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
        this.continueTransaction.transaction$ = data;
        this.continueTransaction.section$ = section;
        this.toCancel = false;

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
   * @param data Texto enviado para continuar a transação, normalmente vazio
   * @description Continua com a transação
   */
  public async continue(data: string): Promise<unknown> {
    if (this.toCancel) {
      await this.continueTransaction.sendStatus(
        0,
        "Existia um pedido de cancelamento. O mesmo foi aceito."
      );
      this.toCancel = false;
      return await this.continueTransaction.execute("0");
    }
    return await this.continueTransaction.execute(data);
  }

  /**
   * Finaliza uma transação
   */
  public async finish(data: IFinishTransaction) {
    this.toCancel = false;
    return await this.finishTransaction.execute(data);
  }

  /**
   * @description Requisita o cancelamento de uma transação
   * É necessário a confirmação - confirmCancel(true / false)
   */
  public async requestCancel() {
    if (this.toCancel) {
      return;
    }
    this.toCancel = true;
    this.continueTransaction.section$.continue = -1;
  }

  /**
   *
   * @param cancel Confirma o cancelamento da transaçaõ
   * @description Cancela uma transação
   */
  public async confirmCancel(cancel: boolean) {
    this.toCancel = false;
    if (cancel === true) {
      return await this.continue("0");
    } else {
      return await this.continue(`1`);
    }
  }

  /**
   *
   * @returns Retorna o estado atual do agente
   */
  public async getState() {
    return await this.getStateService.execute();
  }

  public async getVersion() {
    return await this.getVersionService.execute();
  }

  public async openPinpad(sessionId: string | null = null) {
    if (!sessionId && !this.sessionId$) {
      return { status: -1, message: "Não existe uma sessão ativa" };
    }
    return await this.openPinpadService.execute(sessionId || this.sessionId$!);
  }

  public async closePinpad(sessionId: string | null = null) {
    if (!sessionId && !this.sessionId$) {
      return { status: -1, message: "Não existe uma sessão ativa" };
    }
    return await this.closePinpadService.execute(sessionId || this.sessionId$!);
  }

  public async isPresentPinpad(sessionId: string | null = null) {
    if (!sessionId && !this.sessionId$) {
      return { status: -1, message: "Não existe uma sessão ativa" };
    }
    return await this.isPresentPinpadService.execute(sessionId || this.sessionId$!);
  }

  public async readYesNoPinpad(sessionId: string | null = null, message: string) {
    if (!sessionId && !this.sessionId$) {
      return { status: -1, message: "Não existe uma sessão ativa" };
    }
    return await this.readYesNoPinpadService.execute(sessionId || this.sessionId$!, message);
  }

  public async setDisplayMessagePinpad(sessionId: string | null = null, message: string, persistent: string) {
    if (!sessionId && !this.sessionId$) {
      return { status: -1, message: "Não existe uma sessão ativa" };
    }
    return await this.setDisplayMessagePinpadService.execute(sessionId || this.sessionId$!, message, persistent);
  } 

  public async createSession() {
    const session = await this.createSessionService.execute();
    if (session?.sessionId) {
      this.sessionId$ = session.sessionId;
    }
    return session;
  }

  // #endregion Estágios (5)

  // #region Listeners (4)

  /**
   *
   * Método responsável por receber as respostas de transações aprovadas
   */
  public onApproved(callback: (data: { status: number, displayId: string}) => void) {
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
      } else if (
        this.startTransaction.message$ === null ||
        this.startTransaction.message$ !== status
      ) {
        this.startTransaction.message$ = status;
        callback(status);
      }
    };
    this.continueTransaction.listenQuestion(pong);
    this.startTransaction.listenQuestion(pong);
  }

  // #endregion Listeners (4)
}
