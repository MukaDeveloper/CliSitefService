const qs = require("qs");
import { IContinueTransactionResponse } from "../../interfaces";
import { BaseService } from "../../shared/base";
import axios, { AxiosError } from "axios";
import { Agent } from "https";
import FinishTransaction from "./finish-transaction.service";

export default class ContinueTransaction extends BaseService {
  constructor() {
    super();
  }

  async execute(data: string, section: any) {
    /**
     * Comunicação com o agenteCliSiTef
     */
    try {
      /**
       * Requisição POST para o agenteCliSiTef
       */
      section.data = data;
      const res = await axios.post<any>(
        this.agenteUri + "/continueTransaction",
        qs.stringify(section),
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
      const response = res?.data as IContinueTransactionResponse;
      if (response) {
        if (response.commandId != 0) {
            this.sendStatus(response.data);
            //  console.log(`[${response.commandId}] ${response?.data}`);
        }
        if (response.serviceStatus != 0) {
          // console.log("Erro serviceMessage =>", response.serviceMessage);
          throw new Error(response.serviceMessage || "");
        }

        if (response.clisitefStatus != 10000) {
          if (response.clisitefStatus == 0) {
            const finish = new FinishTransaction();
            await finish.execute(1, false, false, section);
          }
          // console.log(`Fim - Retorno: ${response.clisitefStatus}`);
          return `Fim - Retorno: ${response.clisitefStatus}`;
        }

        let lastStatus;
        if (response.commandId != 23) {
          lastStatus = "";
        }

        switch (response.commandId) {
          case 0:
            if (response.fieldId == 121) {
              // console.log("Cupom Estabelecimento: \n" + response?.data);
            }

            if (response.fieldId == 122) {
              // console.log("Cupom Cliente: \n" + response?.data);
            }
            this.execute("", section);
            break;
          case 1:
          case 2:
          case 3:
          case 4:
          case 15:
          case 11:
			    case 12:
			    case 13:
			    case 14:
			    case 16:
          case 20:
            this.execute("", section);
            break;
          case 22:
            setTimeout(() => { this.execute("", section)}, 1000)
            break;
          case 23:
            const status = response?.data;
            if (lastStatus != status) {
              // console.log(status);
              lastStatus = status;
            }
            setTimeout(() => {
              this.execute(response.data, section);
            }, 1000);
            break;
          case 21:
          case 30:
          case 31:
          case 32:
          case 33:
          case 34:
          case 35:
          case 38:
            this.execute("", section);
            break;
          default:
            this.execute("", section);
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
        console.error(
          `Error response from server: ${axiosError.response.status}`
        );

        /**
         * Verifique se a resposta de erro é um objeto com uma propriedade 'message'.
         */
        if (isErrorWithMessage(axiosError.response?.data)) {
          throw new Error(
            `Erro ao continuar transação: ${axiosError.response?.data.message}`
          );
        } else {
          /**
           * Se não for um objeto com 'message', apenas stringify o que quer que seja.
           */
          throw new Error(
            `Erro ao continuar transação: ${JSON.stringify(
              axiosError.response?.data
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
