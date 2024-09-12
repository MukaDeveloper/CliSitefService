import { Subject } from "rxjs";
import { ISession } from "../interfaces/i-session";
import { ITransaction } from "../interfaces/i-transaction";

export class GlobalConfig {
  // #region Properties (5)

  public static log$: Subject<string | null> = new Subject<string | null>();
  public static question$: Subject<string | null> = new Subject<string | null>();
  public static session$: Subject<ISession | null> = new Subject<ISession | null>();
  public static status$: Subject<string | null> = new Subject<string | null>();
  public static transaction$: Subject<ITransaction | null> = new Subject<ITransaction | null>();

  // #endregion Properties (5)

  // #region Constructors (1)

  constructor() {}

  // #endregion Constructors (1)
}
