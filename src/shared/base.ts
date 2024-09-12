import { EventEmitter } from "events";
import { ISendStatus } from "../interfaces/i-send-status";

export class BaseService {
  // #region Properties (2)

  private emitter: EventEmitter;

  protected agenteUri: string;

  // #endregion Properties (2)

  // #region Constructors (1)

  constructor() {
    this.agenteUri = "https://127.0.0.1/agente/clisitef";
    this.emitter = new EventEmitter();
  }

  // #endregion Constructors (1)

  // #region Public Methods (10)

  public getApproved(callback: (data: { status: number, displayId: string}) => void) {
    this.emitter.on("transactionApproved", callback);
  }

  public listenErrors(callback: (res: ISendStatus) => void) {
    this.emitter.on("transactionErrors", callback);
  }

  public listenLogs(callback: (res: ISendStatus) => void) {
    this.emitter.on("transactionLogs", callback);
  }

  public listenQuestion(callback: (res: ISendStatus) => void) {
    this.emitter.on("transactionQuestion", callback);
  }

  public listenStatus(callback: (res: ISendStatus) => void) {
    this.emitter.on("transactionStatus", callback);
  }

  public sendApproved(status: number, displayId: string) {
    this.emitter.emit("transactionApproved", { status, displayId });
  }

  public sendError(status: number, message: string) {
    if (message === "" || !message) return;
    this.emitter.emit("transactionErrors", { status, message } as ISendStatus);
  }

  public sendLogs(status: number, message: string) {
    this.emitter.emit("transactionLogs", { status, message } as ISendStatus);
  }

  public sendQuestion(status: number, message: string) {
    if (message === "" || !message) return;
    this.emitter.emit("transactionQuestion", { status, message } as ISendStatus);
  }

  public sendStatus(status: number, message: string) {
    this.emitter.emit("transactionStatus", { status, message } as ISendStatus);
  }

  // #endregion Public Methods (10)
}
