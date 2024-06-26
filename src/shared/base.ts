import { EventEmitter } from "events";

export class BaseService {
    protected agenteUri: string;
    private emitter: EventEmitter;
    public transaction$: any = {};
    public section$: any = {};

    constructor() {
        this.agenteUri = 'https://127.0.0.1/agente/clisitef';
        this.emitter = new EventEmitter();
    }

    public sendStatus(status: string) {
        if (status === (null || "")) return;
        this.emitter.emit('transactionStatus', status);
    }
    public onSendStatus(callback: (res: any) => void) {
        this.emitter.on('transactionStatus', callback);
    }
    public sendResponseRequest(response: any) {
        this.emitter.emit('transactionResponse', response);
    }
    public onSendResponseRequest(callback: (response: any) => void) {
        this.emitter.on('transactionResponse', callback);
    }
}