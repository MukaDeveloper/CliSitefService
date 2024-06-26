const EventEmitter = require('events');

export class BaseService extends EventEmitter {
    protected agenteUri: string;
    public transaction$: any = {};

    constructor() {
        super();
        this.agenteUri = 'https://127.0.0.1/agente/clisitef';
    }

    public async sendStatus(status: string) {
        await this.emit('transactionStatus', status);
    }

    public async onSendStatus(callback: (res: any) => void) {
        await this.on('transactionStatus', callback);
    }
}