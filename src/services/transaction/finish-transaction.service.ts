const qs = require("qs");
import axios, { AxiosError } from "axios";
import { Agent } from "https";
import { BaseService } from "../../shared/base";

export default class FinishTransaction extends BaseService {
  constructor() {
    super();
  }

  async execute(
    confirm: number,
    resendParameters: boolean,
    exitFlow: boolean,
    section: any,
  ): Promise<any> {
    const args: any = {
      confirm: `${confirm}`,
    };

    if (resendParameters) {
      args.sitefIp = `${this.transaction$.sitefIp}`;
      args.storeId = `${this.transaction$.storeId}`;
      args.terminalId = `${this.transaction$.terminalId}`;
      args.taxInvoiceNumber = `${this.transaction$.taxInvoiceNumber}`;
      args.taxInvoiceDate = `${this.transaction$.taxInvoiceDate}`;
      args.taxInvoiceTime = `${this.transaction$.taxInvoiceTime}`;
    } else {
      args.sessionId = `${section.sessionId}`;
      args.taxInvoiceNumber = `${section.taxInvoiceNumber || this.transaction$.taxInvoiceNumber}`;
      args.taxInvoiceDate = `${section.taxInvoiceDate || this.transaction$.taxInvoiceDate}`;
      args.taxInvoiceTime = `${section.taxInvoiceTime || this.transaction$.taxInvoiceTime}`;
    }

    try {
      const res = await axios.post<any>(
        this.agenteUri + "/finishTransaction",
        qs.stringify(args),
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

      const response = res?.data;
      if (response) {
        if (response.serviceStatus != 0) {
          // console.log("Aqui ele dá o reload na página");
        } else {
          if (exitFlow) {
            this.sendStatus("Transação finalizada.");
            // console.log(`Estado do serviço: ${response.serviceStatus}\nEstado CliSiTef: ${response.clisitefStatus}`);
          }
        }
        return response;
      }
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}
