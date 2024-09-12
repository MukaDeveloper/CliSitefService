import { Subject } from "rxjs";
import { ISession } from "../interfaces/i-session";
import { ITransaction } from "../interfaces/i-transaction";

export class GlobalConfig {
	// #region Properties (6)

	public static error$: Subject<any | null> = new Subject<any | null>();
	public static log$: Subject<string | null> = new Subject<string | null>();
	public static question$: Subject<string | null> = new Subject<string | null>();
	public static session$: Subject<ISession | null> = new Subject<ISession | null>();
	public static status$: Subject<string | null> = new Subject<string | null>();
	public static transaction$: Subject<ITransaction | null> = new Subject<ITransaction | null>();

	// #endregion Properties (6)

	// #region Constructors (1)

	constructor() {}

	// #endregion Constructors (1)

	// #region Public Methods (1)

	public clearSubjects() {
		GlobalConfig.log$.next(null);
		GlobalConfig.question$.next(null);
		GlobalConfig.session$.next(null);
		GlobalConfig.status$.next(null);
		GlobalConfig.transaction$.next(null);
	}

	// #endregion Public Methods (1)
}
