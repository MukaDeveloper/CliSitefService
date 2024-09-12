/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qs = require("qs");
import axios, { AxiosError } from "axios";
import { Agent } from "https";
import { BaseService } from "../../shared/base";
import { IFinishTransaction } from "../../interfaces/i-finish-transaction";
import { GlobalConfig } from "../../shared/global";
import { ISession } from "../../interfaces/i-session";
import { ITransaction } from "../../interfaces/i-transaction";

export default class FinishTransaction extends BaseService {
	// #region Properties (2)

	private session: ISession | null = null;
	private transaction: ITransaction | null = null;

	// #endregion Properties (2)

	// #region Constructors (1)

	constructor() {
		super();

		GlobalConfig.transaction$.subscribe((res) => (this.transaction = res));
		GlobalConfig.session$.subscribe((res) => (this.session = res));
	}

	// #endregion Constructors (1)

	// #region Public Methods (1)

	/**
	 * Confirmar ou estornar uma transação;
	 *
	 * @param confirm Indica se a transação deve ser confirmada (1) ou estornada (0)
	 * @param transaction Informações da transação
	 */
	public async execute(data: IFinishTransaction): Promise<any> {
		try {
			if (!data) {
				data = {
					confirm: "1",
					sessionId: this.session?.sessionId,
					sitefIp: this.transaction?.sitefIp,
					storeId: this.transaction?.storeId,
					taxInvoiceDate: this.transaction?.taxInvoiceDate,
					taxInvoiceNumber: this.transaction?.taxInvoiceNumber,
					taxInvoiceTime: this.transaction?.taxInvoiceTime,
					terminalId: this.transaction?.terminalId,
				} as IFinishTransaction;
			}
			const res = await axios.post<any>(this.agenteUri + "/finishTransaction", qs.stringify(data), {
				httpsAgent: new Agent({ rejectUnauthorized: false }),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Accept: "*/*",
					"Accept-Encoding": "gzip, deflate, br",
					Connection: "keep-alive",
				},
			});

			const response = res?.data;
			if (response?.serviceStatus === 0) {
				const message = "Transação finalizada.";
				response.serviceMessage = message;
			}
			return response;
		} catch (error: any) {
			/**
			 * Retorno de erro do try/catch
			 */
			const axiosError = error as AxiosError;
			/**
			 * Função tipo guarda para verificar se o erro é um objeto com mensagem.
			 */
			const isErrorWithMessage = (err: any): err is { message: string } => error.message !== undefined;

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
					message = `Erro ao finalizar transação: ${JSON.stringify(axiosError?.response.data)}`;
					console.error(message);
				}
				return message;
			} else if (axiosError?.request) {
				console.error(`Nenhuma resposta do servidor ao finalizar transação: ${axiosError?.message}`);
			} else {
				console.error(`Erro ao configurar a requisição ao finalizar transação: ${axiosError?.message}`);
			}
			this.sendError(axiosError?.status || error?.status || 500, axiosError?.message || error?.message || "Erro desconhecido");
			return axiosError?.message || error?.message || "Erro desconhecido";
		}
	}

	// #endregion Public Methods (1)
}
