/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from "events";
import { ISendStatus } from "../interfaces/i-send-status";

export class BaseService {
  // #region Properties (4)

  private emitter: EventEmitter;

  protected agenteUri: string;

  public section$: any = {};
  public transaction$: any = {};
  public message$: ISendStatus | null = null;

  // #endregion Properties (4)

  // #region Constructors (1)

  constructor() {
    this.agenteUri = "https://127.0.0.1/agente/clisitef";
    this.emitter = new EventEmitter();
  }

  // #endregion Constructors (1)

  // #region Public Methods (4)

  public getApproved(callback: () => void) {
    this.emitter.on("transactionApproved", callback);
  }

  public listenStatus(callback: (res: ISendStatus) => void) {
    this.emitter.on("transactionStatus", callback);
  }

  public sendApproved() {
    this.emitter.emit("transactionApproved");
  }

  public sendStatus(status: number, message: string) {
    if (message === "" || !message) return;
    this.emitter.emit("transactionStatus", { status, message } as ISendStatus);
  }

  // #endregion Public Methods (4)
}
