import { GlobalConfig } from "./utils";
import { EventEmitter } from "events";

export class BaseService extends EventEmitter {
    private globalConfig = new GlobalConfig();
    protected agente_uri: string;

    constructor() {
        super();
        this.agente_uri = this.globalConfig.agente_uri;
    }

    public sendEmitter(status: number, message: string) {
        this.emit('transaction', { status, message });
    }
}