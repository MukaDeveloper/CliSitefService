import { IContinueTransaction } from "../../interfaces";
import { BaseService } from "../../shared/base";
import axios, { AxiosError } from "axios";
import { Agent } from 'https';

export default class ContinueTransaction extends BaseService {
  constructor() {
    super();
  }

  async execute(transaction: IContinueTransaction) {
    /**
     * Comunicação com o agenteCliSiTef
     */
    try {
      /**
       * Requisição POST para o agenteCliSiTef
       */
      const res = await axios.post<any>(
        this.agenteUri + "/continueTransaction",
        transaction, {
            httpsAgent: new Agent({ rejectUnauthorized: false })
        }
      );
      const data = res?.data;
      if (data) {

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
            `Erro ao continuar transação: ${axiosError.response.data.message}`
          );
        } else {
          /**
           * Se não for um objeto com 'message', apenas stringify o que quer que seja.
           */
          throw new Error(
            `Erro ao continuar transação: ${JSON.stringify(
              axiosError.response.data
            )}`
          );
        }
      } else if (axiosError.request) {
        throw new Error(
          `Nenhuma resposta do servidor ao continuar transação: ${axiosError.message}`
        );
      } else {
        throw new Error(
          `Erro ao configurar a requisição ao continuar transação: ${axiosError.message}`
        );
      }
    }
  }
}
