import { EventEmitter } from "events";
import { ISendStatus } from "../interfaces/i-send-status";

export class BaseService {
  // #region Properties (5)

  private emitter: EventEmitter;

  protected agenteUri: string;

  public message$: ISendStatus | null = null;

  // #endregion Properties (5)

  // #region Constructors (1)

  constructor() {
    this.agenteUri = "https://127.0.0.1/agente/clisitef";
    this.emitter = new EventEmitter();
  }

  // #endregion Constructors (1)

  // #region Approved (2)

  public sendApproved() {
    this.emitter.emit("transactionApproved");
  }

  public getApproved(callback: () => void) {
    this.emitter.on("transactionApproved", callback);
  }
  
  // #endregion Approved (2)

  // #region Status (6)

  public listenStatus(callback: (res: ISendStatus) => void) {
    this.emitter.on("transactionStatus", callback);
  }

  public sendStatus(status: number, message: string) {
    if (message === "" || !message) return;
    this.emitter.emit("transactionStatus", { status, message } as ISendStatus);
  }

  public listenLogs(callback: (res: ISendStatus) => void) {
    this.emitter.on("transactionLogs", callback);
  }

  public sendLogs(status: number, message: string) {
    if (message === "" || !message) return;
    this.emitter.emit("transactionLogs", { status, message } as ISendStatus);
  }

  public listenQuestion(callback: (res: ISendStatus) => void) {
    this.emitter.on("transactionQuestion", callback);
  }

  public sendQuestion(status: number, message: string) {
    if (message === "" || !message) return;
    this.emitter.emit("transactionQuestion", { status, message } as ISendStatus);
  }

  // #endregion Status (6)
}
