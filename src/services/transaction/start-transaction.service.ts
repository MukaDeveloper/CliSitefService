const qs = require("qs");
import {
  IStartTransaction,
  IStartTransactionResponse,
} from "../../interfaces";
import { BaseService } from "../../shared/base";
import axios, { AxiosError } from "axios";
import { Agent } from "https";
import ContinueTransaction from "./continue-transaction.service";

export default class StartTransaction extends BaseService {
  constructor() {
    super();
  }

  async execute(transaction: IStartTransaction): Promise<any> {
    /**
     * Comunicação com o cliente inicializador da transação
     */
    await this.sendStatus("Iniciando transação...");
    console.log("[0] Iniciando transação...");
    /**
     * Comunicação com o agenteCliSiTef
     */
    try {
      /**
       * Requisição POST para o agenteCliSiTef
       */
      const res = await axios.post<any>(
        this.agenteUri + "/startTransaction",
        qs.stringify(transaction),
        {
          httpsAgent: new Agent({ rejectUnauthorized: false }),
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
          },
        }
      );
      const response = res?.data as IStartTransactionResponse;
      if (response) {
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
        if (response.serviceStatus != 0) {
          /**
           * Retorno de erro caso o estado do serviço seja diferente de 0
           */
          // console.log(`[${response.serviceStatus}] Agente ocupado. \n ${response.serviceMessage}`);
          throw new Error(response.serviceMessage);
        } else if (response.clisitefStatus != 10000) {
          /**
           * Retorno de erro caso o estado da transação seja diferente de 10000
           */
          // console.log(`[${response.serviceStatus}] Retorno CliSiTef \n ${response.serviceMessage}`);
          throw new Error(`${response.clisitefStatus} | Retorno CliSiTef [NOT10K]`);
        } else {
          /**
           * Continua a transação com o identificador de sessão;
           */
          const continueTef = new ContinueTransaction();
          /**
           * É necessário instanciar a continuação da transação para cada
           * vez que isso ocorrer;
           */
          const section = {
            sessionId: response.sessionId,
            continua: "0",
            cupomFiscal: transaction.taxInvoiceNumber,
            dataFiscal: transaction.taxInvoiceDate,
            horaFiscal: transaction.taxInvoiceTime,
            ret: [],
            functionalId: transaction.functionalId,
          };
          this.transaction$ = transaction;
          // console.log("Acessando continue...");
          await continueTef.execute("", section);
          return response;
        }
      } else {
        /**
         * Retorno de erro caso não haja resposta válida do Axios
         */
        // console.log(`[AXS404] Ocorreu um erro durante a transação.`);
        throw new Error(`[AXS404] Ocorreu um erro durante a transação.`);
      }
    } catch (error: any) {
      /**
       * Retorno de erro do try/catch
       */
      const axiosError = error as AxiosError;
      /**
       * Função tipo guarda para verificar se o erro é um objeto com mensagem.
       */
      const isErrorWithMessage = (err: any): err is { message: string } =>
        error.message !== undefined;

      if (axiosError.response) {
        console.error(
          `Error response from server: ${axiosError.response.status}`
        );

        /**
         * Verifique se a resposta de erro é um objeto com uma propriedade 'message'.
         */
        if (isErrorWithMessage(axiosError.response.data)) {
          throw new Error(
            `Erro ao iniciar transação: ${axiosError.response.data.message}`
          );
        } else {
          /**
           * Se não for um objeto com 'message', apenas stringify o que quer que seja.
           */
          throw new Error(
            `Erro ao iniciar transação: ${JSON.stringify(
              axiosError.response.data
            )}`
          );
        }
      } else if (axiosError.request) {
        throw new Error(
          `Nenhuma resposta do servidor ao iniciar transação: ${axiosError.message}`
        );
      } else {
        throw new Error(
          `Erro ao configurar a requisição ao iniciar transação: ${axiosError.message}`
        );
      }
    }
  }
}
