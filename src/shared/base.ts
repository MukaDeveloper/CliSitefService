import { EventEmitter } from "events";
import { ISendStatus } from "../interfaces/i-send-status";

export class BaseService {
    protected agenteUri: string;
    private emitter: EventEmitter;
    public transaction$: any = {};
    public section$: any = {};

    constructor() {
        this.agenteUri = 'https://127.0.0.1/agente/clisitef';
        this.emitter = new EventEmitter();
    }

    public sendStatus(status: number, message: string) {
        if (message === (null || "")) return;
        this.emitter.emit('transactionStatus', { status, message } as ISendStatus);
    }
    public listenStatus(callback: (res: any) => void) {
        this.emitter.on('transactionStatus', callback);
    }

    public sendApproved() {
        this.emitter.emit('transactionApproved');
    }
    public getApproved(callback: () => void) {
        this.emitter.on('transactionApproved', callback);
    }
}