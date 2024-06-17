import { IStartTransaction } from "../../interfaces";
import { BaseService } from "../../shared/base";
import { ContinueTransaction } from "./continue-transaction.service";

export class StartTransaction extends BaseService {
    
    constructor(
        private readonly continueTransaction: ContinueTransaction,
    ) {
        super();
    }

    async execute(transaction: IStartTransaction) {
        /**
         * Comunicação com o cliente inicializador da transação
         */
        this.sendEmitter(-1, 'Iniciando transação...');

        /**
         * Comunicação com o agenteCliSiTef
         */
        $.ajax({
        	url: this.agente_uri + "/startTransaction",
		    type:"post",
    		data: jQuery.param(transaction),
	    }).done((res) => {
            /**
             * Retorno do estado do serviço
             * 
             * (0 - OK; 1 - NOK)
             * serviceStatus;
             * 
             * (Recebe somente em caso do estado do serviço ser 1)
             * serviceMessage;
             * 
             * (Resultado de resposta. Caso seja 10000, procede-se continuação da transação)
             * clisitefStatus;
             * 
             * (Identificação da sessão)
             * sessionId;
             */
            if (res.serviceStatus === 0) {
                this.sendEmitter(0, 'Conectando...');
                if (res.clisitefStatus === 10000) {
                    /**
                     * Continua a transação com o identificador de sessão;
                     */
                    this.continueTransaction.execute(res.sessionId);
                } else {
                    this.sendEmitter(res.clisitefStatus, 'Ocorreu um erro durante a transação.');
                }
            } else {
                this.sendEmitter(1, res.serviceMessage);
            }
        })
    }
}
