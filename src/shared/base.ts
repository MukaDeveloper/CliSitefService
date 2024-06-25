const EventEmitter = require('events');

export class BaseService extends EventEmitter {
    protected agenteUri: string;
    public transaction$: any = {};

    constructor() {
        super();
        this.agenteUri = 'https://127.0.0.1/agente/clisitef';
    }

    public sendStatus(status: string) {
        this.emit('transactionStatus', status);
    }

    public onSendStatus(callback: (res: any) => void) {
        this.on('transactionStatus', callback);
    }
}