/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qs = require("qs");
import { IContinueTransactionResponse } from "../../interfaces";
import { IFinishTransaction } from "../../interfaces/i-finish-transaction";
import { BaseService } from "../../shared/base";
import axios, { AxiosError } from "axios";
import { Agent } from "https";
import FinishTransaction from "./finish-transaction.service";

export default class ContinueTransaction extends BaseService {
  // #region Constructors (1)
  public section$: any = {};
  public transaction$: any = {};

  constructor() {
    super();
  }

  // #endregion Constructors (1)

  public async sendFinished() {
    const finishTransaction = new FinishTransaction();
    
    const data = {
      confirm: "1",
      sessionId: this.section$.sessionId,
      sitefIp: this.transaction$?.sitefIp,
      storeId: this.transaction$?.storeId,
      taxInvoiceDate: this.transaction$?.taxInvoiceDate,
      taxInvoiceNumber: this.transaction$?.taxInvoiceNumber,
      taxInvoiceTime: this.transaction$?.taxInvoiceTime,
      terminalId: this.transaction$?.terminalId,
    } as IFinishTransaction;

    const finish = await finishTransaction.execute(data);
    this.sendStatus(-1, finish.serviceMessage);
  }

  // #region Public Methods (1)

  public async execute(data: string) {
    /**
     * Comunicação com o agenteCliSiTef
     */
    if (!this.section$) {
      return "Informações de seção não encontradas.";
    }
    try {
      /**
       * Requisição POST para o agenteCliSiTef
       */
      const section = this.section$;
      section.data = data;
      const res = await axios.post<IContinueTransactionResponse>(
        this.agenteUri + "/continueTransaction",
        qs.stringify(section),
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
        // if (response.commandId != 0 && response.data != "") {
        //   if (response.commandId !== 1 && response.commandId !== 3) {
        //     this.sendLogs(response.commandId, response.data);
        //   }
        // }
        if (response.serviceStatus != 0) {
          throw new Error(response.serviceMessage || "");
        }

        if (response.clisitefStatus != 10000) {
          if (response.clisitefStatus == 0) {
            this.sendApproved();
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
              this.sendLogs(2, "Cupom Estabelecimento: \n" + response?.data);
            }
            if (response.fieldId == 122) {
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
            if (response?.data?.startsWith("13 -")) {
              return this.sendQuestion(13, 'Deseja cancelar a operação?');
            }
            break;

          case 22:
            this.sendQuestion(22, response?.data);
            setTimeout(() => {
              this.execute("");
            }, 1000);
            break;

          case 23:
            if (lastStatus != response?.data) {
              lastStatus = response?.data;
            }
            setTimeout(() => {
              this.execute("");
              section.continue = "0";
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
            if (response.commandId === 21) {
              if (response?.data?.startsWith("1:Cheque;")) {
                if (section.functionalId) {
                  this.execute(section.functionalId);
                } else {
                  return this.sendQuestion(21.1, response?.data);
                }
              }
              if (response?.data?.startsWith("1:A Vista;")) {
                if (section.functionalType) {
                  this.execute(section.functionalType);
                } else {
                  return this.sendQuestion(21.2, response?.data);
                }
              }
              break;
            }
            if (response.commandId === 34) {
              return this.sendQuestion(34, response?.data);
            }
            break;
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

  // #endregion Public Methods (1)
}
