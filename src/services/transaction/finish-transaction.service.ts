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
    transaction: any
  ): Promise<any> {
    const args: any = {
      confirm: `${confirm}`,
    };

    console.log('> transaction$', transaction);
    if (resendParameters) {
      args.sitefIp = `${transaction.sitefIp}`;
      args.storeId = `${transaction.storeId}`;
      args.terminalId = `${transaction.terminalId}`;
      args.taxInvoiceNumber = `${transaction.taxInvoiceNumber}`;
      args.taxInvoiceDate = `${transaction.taxInvoiceDate}`;
      args.taxInvoiceTime = `${transaction.taxInvoiceTime}`;
    } else {
      args.sessionId = `${section.sessionId}`;
      args.taxInvoiceNumber = `${
        section.taxInvoiceNumber || transaction.taxInvoiceNumber
      }`;
      args.taxInvoiceDate = `${
        section.taxInvoiceDate || transaction.taxInvoiceDate
      }`;
      args.taxInvoiceTime = `${
        section.taxInvoiceTime || transaction.taxInvoiceTime
      }`;
    }

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
      if (response) {
        if (exitFlow) {
          this.sendStatus("Transação finalizada.");
        }

        return response;
      }
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}
