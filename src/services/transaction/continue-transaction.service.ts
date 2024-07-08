/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qs = require("qs");
import { IFinishTransaction } from "../../interfaces/i-finish-transaction";
import { BaseService } from "../../shared/base";
import axios, { AxiosError } from "axios";
import { Agent } from "https";
import FinishTransaction from "./finish-transaction.service";
import { IContinueTransactionResponse } from "../../interfaces/i-continue-transaction";
import { ITransaction } from "../../interfaces/i-transaction";
import { ISession } from "../../interfaces/i-session";
import { GlobalConfig } from "../../shared/global";

export default class ContinueTransaction extends BaseService {
  // #region Properties (2)

  private transaction: ITransaction | null = null;
  private session: ISession | null = null;

  // #endregion Properties (2)

  // #region Constructors (1)

  constructor() {
    super();

    GlobalConfig.transaction$.subscribe((res) => this.transaction = res);
    GlobalConfig.session$.subscribe((res) => this.session = res);
  }

  // #endregion Constructors (1)

  // #region Public Methods (2)

  public async execute(data: string) {
    /**
     * Comunicação com o agenteCliSiTef
     */
    try {
      if (!this.session) {
        throw new Error("Informações de sessão não encontradas.");
      }
      /**
       * Requisição POST para o agenteCliSiTef
       */
      this.session.data = data;
      const res = await axios.post<IContinueTransactionResponse>(
        this.agenteUri + "/continueTransaction",
        qs.stringify(this.session),
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
      const response = res?.data as IContinueTransactionResponse;
      if (response) {
        if (response.serviceStatus != 0) {
          throw new Error(response.serviceMessage || "");
        }
        if (response.clisitefStatus != 10000) {
          if (response.clisitefStatus == 0) {
            this.sendApproved(0, this.transaction?.taxInvoiceNumber || "");
          }
          return await this.sendFinished();
        }
        let lastStatus;
        if (response.commandId != 23) {
          lastStatus = "";
        }
        switch (response.commandId) {
          case 0:
            if (response.fieldId == 121) {
              this.sendStatus(response.fieldId, "Imprimindo Cupom...");
              this.sendLogs(2, "Cupom Estabelecimento: \n" + response?.data);
            }
            if (response.fieldId == 122) {
              this.sendStatus(response.fieldId, "Imprimindo Cupom...");
              this.sendLogs(2, "Cupom Cliente: \n" + response?.data);
            }
            this.execute("");
            break;
          case 1:
          case 2:
          case 3:
          case 4:
          case 15:
            this.sendStatus(response.commandId, response?.data);
            this.execute("");
            break;
          case 11:
          case 12:
          case 13:
          case 14:
          case 16:
            this.sendStatus(response.commandId, "");
            this.execute("");
            break;
          case 20:
          case 22:
            return this.sendQuestion(response.commandId, response?.data);
          case 23:
            if (lastStatus != response?.data) {
              lastStatus = response?.data;
            }
            setTimeout(() => {
              this.execute("");
              this.session!.continue = "0";
            }, 500);
            break;
          case 21:
          case 30:
          case 31:
          case 32:
          case 33:
          case 34:
          case 35:
          case 38:
            return this.sendQuestion(response.commandId, response?.data);
          default:
            this.execute("");
        }
      } else {
        throw new Error("Erro ao continuar transação");
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
        let message = `Error response from server: ${axiosError.response.status}`;
        console.error(message);

        /**
         * Verifique se a resposta de erro é um objeto com uma propriedade 'message'.
         */
        if (isErrorWithMessage(axiosError.response?.data)) {
          message = `Erro ao continuar transação: ${axiosError.response?.data.message}`;
          console.error(message);
        } else {
          /**
           * Se não for um objeto com 'message', apenas stringify o que quer que seja.
           */
          message = `Erro ao continuar transação: ${JSON.stringify(
            axiosError.response?.data
          )}`;
          console.error(message);
        }
      } else if (axiosError.request) {
        console.error(
          `Nenhuma resposta do servidor ao continuar transação: ${axiosError.message}`
        );
      } else {
        console.error(
          `Erro ao configurar a requisição ao continuar transação: ${axiosError.message}`
        );
      }
      return axiosError?.message || error?.message || "Erro desconhecido";
    }
  }

  public async sendFinished() {
    const finishTransaction = new FinishTransaction();
    const data = {
      confirm: "1",
      sessionId: this.session?.sessionId,
      sitefIp: this.transaction?.sitefIp,
      storeId: this.transaction?.storeId,
      taxInvoiceDate: this.transaction?.taxInvoiceDate,
      taxInvoiceNumber: this.transaction?.taxInvoiceNumber,
      taxInvoiceTime: this.transaction?.taxInvoiceTime,
      terminalId: this.transaction?.terminalId,
    } as IFinishTransaction;

    const finish = await finishTransaction.execute(data);
    this.sendStatus(-1, finish.serviceMessage);
  }

  // #endregion Public Methods (2)
}
