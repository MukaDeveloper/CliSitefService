/* eslint-disable @typescript-eslint/no-explicit-any */
//  https://127.0.0.1/agente/clisitef/state

import axios, { AxiosError } from "axios";
import { BaseService } from "../../shared/base";
import { Agent } from "https";

export default class GetState extends BaseService {
  // #region Constructors (1)

  constructor() {
    super();
  }

  // #endregion Constructors (1)

  // #region Public Methods (1)

  /**
   *
   * @returns
   * serviceStatus: 0 - OK; 1 - NOK;
   * serviceMessage: Recebe somente em caso do estado do serviço ser 1;
   * serviceState:
   *    0 - Não inicializado;
   *    1 - Inicializado e pronto;
   *    2 - StartTransaction já iniciada, aguardando ContinueTransaction;
   *    3 - Processo em andamento, aguardando ContinueTransaction;
   *    4 - Aguardando FinishTransaction.
   * serviceVersion: Versão do agente;
   * sessionId: Chave de sessão atualmente ativa, caso exista.
   */
  public async execute() {
    try {
      const res = await axios.get<any>(this.agenteUri + "/state", {
        httpsAgent: new Agent({ rejectUnauthorized: false }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
        },
      });

      const response = res?.data;
      if (response) {
        return response;
      }
    } catch (error: any) {
      const axiosError = error as AxiosError;
      /**
       * Função tipo guarda para verificar se o erro é um objeto com mensagem.
       */
      const isErrorWithMessage = (err: any): err is { message: string } =>
        error.message !== undefined;

      if (axiosError?.response) {
        let message = `Error response from server: ${axiosError?.response.status}`;
        console.error(message);

        /**
         * Verifique se a resposta de erro é um objeto com uma propriedade 'message'.
         */
        if (isErrorWithMessage(axiosError?.response.data)) {
          message = `Erro ao buscar estado do agente: ${axiosError?.response.data.message}`;
          console.error(message);
        } else {
          /**
           * Se não for um objeto com 'message', apenas stringify o que quer que seja.
           */
          message = `Erro ao buscar estado do agente: ${JSON.stringify(
            axiosError?.response.data
          )}`;
          console.error(message);
        }
        return message;
      } else if (axiosError?.request) {
        console.error(
          `Nenhuma resposta do servidor ao buscar estado do agente: ${axiosError?.message}`
        );
      } else {
        console.error(
          `Erro ao configurar a requisição ao buscar estado do agente: ${axiosError?.message}`
        );
      }
      return axiosError?.message || error?.message || "Erro desconhecido";
    }
  }

  // #endregion Public Methods (1)
}
