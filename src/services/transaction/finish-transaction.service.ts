// eslint-disable-next-line @typescript-eslint/no-var-requires
const qs = require("qs");
import axios, { AxiosError } from "axios";
import { Agent } from "https";
import { BaseService } from "../../shared/base";

export default class FinishTransaction extends BaseService {
  // #region Constructors (1)

  constructor() {
    super();
  }

  // #endregion Constructors (1)

  // #region Public Methods (1)

  /**
   * Confirmar ou estornar uma transação;
   *
   * @param confirm Indica se a transação deve ser confirmada (1) ou estornada (0)
   * @param transaction Informações da transação
   */
  public async execute(confirm: number, transaction: any): Promise<any> {
    const args: any = {
      confirm: `${confirm}`,
      sitefIp: `${transaction.sitefIp}`,
      storeId: `${transaction.storeId}`,
      terminalId: `${transaction.terminalId}`,
      taxInvoiceNumber: `${transaction.taxInvoiceNumber}`,
      taxInvoiceDate: `${transaction.taxInvoiceDate}`,
      taxInvoiceTime: `${transaction.taxInvoiceTime}`,
    };

    console.log("> transaction$", transaction);

    try {
      const res = await axios.post<any>(
        this.agenteUri + "/finishTransaction",
        qs.stringify(args),
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

      const response = res?.data;
      if (response?.serviceStatus === 0) {
        this.sendStatus(2, "Transação finalizada.");
        return response;
      } else {
        if (response?.serviceMessage && response?.serviceStatus === 1) {
          throw new Error(
            response?.serviceStatus + response?.serviceMessage || ""
          );
        } else {
          throw new Error("Desconhecido.");
        }
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

      if (axiosError?.response) {
        let message = `Error response from server: ${axiosError?.response.status}`;
        console.error(message);

        /**
         * Verifique se a resposta de erro é um objeto com uma propriedade 'message'.
         */
        if (isErrorWithMessage(axiosError?.response.data)) {
          message = `Erro ao finalizar transação: ${axiosError?.response.data.message}`;
          console.error(message);
        } else {
          /**
           * Se não for um objeto com 'message', apenas stringify o que quer que seja.
           */
          message = `Erro ao finalizar transação: ${JSON.stringify(
            axiosError?.response.data
          )}`;
          console.error(message);
        }
        return message;
      } else if (axiosError?.request) {
        console.error(
          `Nenhuma resposta do servidor ao finalizar transação: ${axiosError?.message}`
        );
      } else {
        console.error(
          `Erro ao configurar a requisição ao finalizar transação: ${axiosError?.message}`
        );
      }
      return axiosError?.message || error?.message || "Erro desconhecido";
    }
  }

  // #endregion Public Methods (1)
}
