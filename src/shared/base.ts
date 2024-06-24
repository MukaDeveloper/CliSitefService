const EventEmitter = require('events');

export class BaseService extends EventEmitter {
    protected agenteUri: string;

    constructor() {
        super();
        this.agenteUri = 'https://127.0.0.1/agente/clisitef';
    }

    public sendEmitter(status: number, message: string) {
        this.emit('transaction', { status, message });
    }
}