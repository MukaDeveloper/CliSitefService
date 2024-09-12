import { ICreateSession } from "../interfaces/i-create-session";
import { IFinishTransaction } from "../interfaces/i-finish-transaction";
import { ISendStatus } from "../interfaces/i-send-status";
import { ISession } from "../interfaces/i-session";
import { IStartTransaction, IStartTransactionResponse } from "../interfaces/i-start-transaction";
import { ITransaction } from "../interfaces/i-transaction";
import { BaseService } from "../shared/base";
import { GlobalConfig } from "../shared/global";
import GetState from "./general/get-state.service";
import GetVersion from "./general/get-version.service";
import ClosePinpad from "./pinpad/close-pinpad.service";
import IsPresentPinpad from "./pinpad/is-present-pinpad.service";
import OpenPinpad from "./pinpad/open-pinpad.service";
import ReadYesNoPinpad from "./pinpad/read-yes-no-pinpad.service";
import SetDisplayMessagePinpad from "./pinpad/set-display-message-pinpad.service";
import CreateSession from "./session/create-session.service";
import DeleteSession from "./session/delete-session.service";
import GetSession from "./session/get-session.service";
import ContinueTransaction from "./transaction/continue-transaction.service";
import FinishTransaction from "./transaction/finish-transaction.service";
import StartTransaction from "./transaction/start-transaction.service";

export class TefInstance extends BaseService {
	// #region Properties (18)

	private closePinpadService: ClosePinpad;
	private continueTransaction: ContinueTransaction;
	private createSessionService: CreateSession;
	private deleteSessionService: DeleteSession;
	private finishTransaction: FinishTransaction;
	private getSessionService: GetSession;
	private getStateService: GetState;
	private getVersionService: GetVersion;
	private isPresentPinpadService: IsPresentPinpad;
	private log: string = "";
	private openPinpadService: OpenPinpad;
	private question: string = "";
	private readYesNoPinpadService: ReadYesNoPinpad;
	private session: ISession | null = null;
	private setDisplayMessagePinpadService: SetDisplayMessagePinpad;
	private startTransaction: StartTransaction;
	private status: string = "";
	private transaction: ITransaction | null = null;

	// #endregion Properties (18)

	// #region Constructors (1)

	constructor() {
		super();
		this.getStateService = new GetState();
		this.getVersionService = new GetVersion();
		this.createSessionService = new CreateSession();
		this.deleteSessionService = new DeleteSession();
		this.getSessionService = new GetSession();
		this.openPinpadService = new OpenPinpad();
		this.closePinpadService = new ClosePinpad();
		this.isPresentPinpadService = new IsPresentPinpad();
		this.readYesNoPinpadService = new ReadYesNoPinpad();
		this.setDisplayMessagePinpadService = new SetDisplayMessagePinpad();
		this.startTransaction = new StartTransaction();
		this.continueTransaction = new ContinueTransaction();
		this.finishTransaction = new FinishTransaction();

		GlobalConfig.session$.subscribe((res) => (this.session = res));
		GlobalConfig.transaction$.subscribe((res) => (this.transaction = res));
		GlobalConfig.status$.subscribe((res) => (this.status = res || ""));
		GlobalConfig.log$.subscribe((res) => (this.log = res || ""));
		GlobalConfig.question$.subscribe((res) => (this.question = res || ""));
	}

	// #endregion Constructors (1)

	// #region Public Methods (20)

	public async closePinpad(sessionId: string | null = null) {
		if (!sessionId && !this.session?.sessionId) {
			return { status: -1, message: "Não existe uma sessão ativa" };
		}
		return await this.closePinpadService.execute(sessionId || this.session?.sessionId!);
	}

	/**
	 *
	 * @param cancel Confirma o cancelamento da transaçaõ
	 * @description Cancela uma transação
	 */
	public async confirmCancel(cancel: boolean) {
		if (cancel === true) {
			return await this.continue("0");
		} else {
			return await this.continue(`1`);
		}
	}

	/**
	 *
	 * @param data Texto enviado para continuar a transação, normalmente vazio
	 * @description Continua com a transação
	 */
	public async continue(data: string): Promise<unknown> {
		return await this.continueTransaction.execute(data);
	}

	public async createSession(data: ICreateSession) {
		const session = await this.createSessionService.execute(data);
		if (session?.sessionId) {
			this.session!.sessionId = session.sessionId;
		}
		return session;
	}

	public async deleteSession() {
		const res = await this.deleteSessionService.execute();
		GlobalConfig.session$.next(null);
		return res;
	}

	/**
	 * Finaliza uma transação
	 */
	public async finish(data: IFinishTransaction) {
		return await this.finishTransaction.execute(data);
	}

	public async getSession() {
		const res = await this.getSessionService.execute();
		return res;
	}

	/**
	 *
	 * @returns Retorna o estado atual do agente
	 */
	public async getState() {
		return await this.getStateService.execute();
	}

	public async getVersion() {
		return await this.getVersionService.execute();
	}

	public async isPresentPinpad(sessionId: string | null = null) {
		if (!sessionId && !this.session?.sessionId) {
			return { status: -1, message: "Não existe uma sessão ativa" };
		}
		return await this.isPresentPinpadService.execute(sessionId || this.session?.sessionId!);
	}

	/**
	 *
	 * Método responsável por receber as respostas de transações aprovadas
	 */
	public onApproved(callback: (data: { status: number; displayId: string }) => void) {
		this.continueTransaction.getApproved(callback);
	}

	public onError(callback: (status: ISendStatus) => void) {
		this.continueTransaction.listenErrors(callback);
		this.startTransaction.listenErrors(callback);
		this.finishTransaction.listenErrors(callback);
	}

	public async openPinpad(sessionId: string | null = null) {
		if (!sessionId && !this.session?.sessionId) {
			return { status: -1, message: "Não existe uma sessão ativa" };
		}
		return await this.openPinpadService.execute(sessionId || this.session?.sessionId!);
	}

	public async readYesNoPinpad(sessionId: string | null = null, message: string) {
		if (!sessionId && !this.session?.sessionId) {
			return { status: -1, message: "Não existe uma sessão ativa" };
		}
		return await this.readYesNoPinpadService.execute(sessionId || this.session?.sessionId!, message);
	}

	public recieveLogs(callback: (status: ISendStatus) => void) {
		this.continueTransaction.listenLogs(callback);
	}

	public recieveQuestion(callback: (status: ISendStatus) => void) {
		this.continueTransaction.listenQuestion(callback);
		this.startTransaction.listenQuestion(callback);
	}

	/**
	 *
	 * Método responsável por receber as respostas dos eventos
	 * enviados pelos métodos de transação.
	 */
	public recieveStatus(callback: (status: ISendStatus) => void) {
		const pong = (status: ISendStatus) => {
			if (this.status !== status.message) {
				GlobalConfig.status$.next(status.message);
				callback(status);
			}
		};

		this.startTransaction.listenStatus(pong);
		this.continueTransaction.listenStatus(pong);
	}

	/**
	 * @description Requisita o cancelamento de uma transação
	 * É necessário a confirmação - confirmCancel(true / false)
	 */
	public async requestCancel() {
		const data = {
			sessionId: `${this.session?.sessionId}`,
			data: "",
			continue: "-1",
		};
		GlobalConfig.session$.next(data);
	}

	public async setDisplayMessagePinpad(sessionId: string | null = null, message: string, persistent: string) {
		if (!sessionId && !this.session?.sessionId) {
			return { status: -1, message: "Não existe uma sessão ativa" };
		}
		return await this.setDisplayMessagePinpadService.execute(sessionId || this.session?.sessionId!, message, persistent);
	}

	/**
	 *
	 * @param data objeto enviado para iniciar a transação, interface IStartTransaction
	 * @description Inicia a transação com parâmetros de configuração
	 */
	public async start(data: IStartTransaction): Promise<IStartTransactionResponse | void> {
		const state = await this.getState();
		try {
			switch (state?.serviceState) {
				case 0:
					return this.startTransaction.sendStatus(-1, "Agente não inicializado");
				case 2:
				case 3:
					break;
				case 4:
					await this.continueTransaction.sendFinished();
					break;
			}

			const response = await this.startTransaction.execute(data);

			if (response?.clisitefStatus === 10000) {
				const section = {
					sessionId: `${response?.sessionId}`,
					continue: "0",
					data: "",
					ret: [],
				};

				/**
				 * Alimenta as variáveis da instância continue.
				 */
				GlobalConfig.session$.next(section);
				GlobalConfig.transaction$.next(data);

				/**
				 * Continua com a transação.
				 */
				await this.continue("");
				return response;
			} else {
				throw new Error("Erro ao iniciar transação");
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			return {
				serviceStatus: 1,
				serviceMessage: error?.message,
				clisitefStatus: 0,
			};
		}
	}

	// #endregion Public Methods (20)
}
