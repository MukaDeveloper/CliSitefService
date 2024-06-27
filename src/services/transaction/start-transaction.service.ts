// eslint-disable-next-line @typescript-eslint/no-var-requires
const qs = require("qs");
import { IStartTransaction, IStartTransactionResponse } from "../../interfaces";
import { BaseService } from "../../shared/base";
import axios, { AxiosError } from "axios";
import { Agent } from "https";
export default class StartTransaction extends BaseService {
  // #region Constructors (1)

  constructor() {
    super();
  }

  // #endregion Constructors (1)

  // #region Public Methods (1)

  public async execute(
    transaction: IStartTransaction
  ): Promise<IStartTransactionResponse> {
    /**
     * Comunicação com o agenteCliSiTef
     */
    try {
      /**
       * Requisição POST para o agenteCliSiTef
       */
      const res = await axios.post<IStartTransactionResponse>(
        this.agenteUri + "/startTransaction",
        qs.stringify(transaction),
        {
          httpsAgent: new Agent({ rejectUnauthorized: false }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
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
          throw new Error(
            `[${response.serviceStatus}] Agente ocupado. \n ${response.serviceMessage}`
          );
        } else if (response.clisitefStatus != 10000) {
          /**
           * Retorno de erro caso o estado da transação seja diferente de 10000
           */
          throw new Error(
            `${response.clisitefStatus} | Retorno CliSiTef [NOT10K] | ${response.serviceMessage}`
          );
        } else {
          this.sendStatus(1, "Iniciando transação...");
          /**
           * Retorna o sucesso do início da transação;
           *
           * Alimenta a variável global com as informações da transação
           */
          this.transaction$ = transaction;
          return response;
        }
      } else {
        /**
         * Retorno de erro caso não haja resposta válida do Axios
         */
        throw new Error(`[AXS404] Ocorreu um erro durante a transação.`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      /**
       * Retorno de erro do try/catch
       */
      const axiosError = error as AxiosError;
      /**
       * Função tipo guarda para verificar se o erro é um objeto com mensagem.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isErrorWithMessage = (err: any): err is { message: string } =>
        error.message !== undefined;

      if (axiosError?.response) {
        let message = `Error response from server: ${axiosError?.response.status}`;
        console.error(message);

        /**
         * Verifique se a resposta de erro é um objeto com uma propriedade 'message'.
         */
        if (isErrorWithMessage(axiosError?.response.data)) {
          message = `Erro ao iniciar transação: ${axiosError?.response.data.message}`;
          console.error(message);
        } else {
          /**
           * Se não for um objeto com 'message', apenas stringify o que quer que seja.
           */
          message = `Erro ao iniciar transação: ${JSON.stringify(
            axiosError?.response.data
          )}`;
          console.error(message);
        }
        return { serviceStatus: 1, serviceMessage: message, clisitefStatus: 0 };
      } else if (axiosError?.request) {
        console.error(
          `Nenhuma resposta do servidor ao iniciar transação: ${axiosError?.message}`
        );
      } else {
        console.error(
          `Erro ao configurar a requisição ao iniciar transação: ${axiosError?.message}`
        );
      }
      return {
        serviceStatus: 1,
        serviceMessage:
          axiosError?.message || error?.message || "Erro desconhecido",
        clisitefStatus: 0,
      };
    }
  }

  // #endregion Public Methods (1)
}
