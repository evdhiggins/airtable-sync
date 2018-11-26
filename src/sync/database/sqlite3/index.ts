import * as SQLite from "better-sqlite3";
import fetchRowsToSync from "./fetchRowsToSync";
import updateSyncedRow from "./updateSyncedRows";
import { IDatabase, IQueryResult } from "../../../types";

import Sync from "../../../classes/Sync.class";
import SyncRow from "../../../classes/SyncRow.class";

export default class implements IDatabase {
  private sqlite: SQLite;
  constructor(options: any) {
    this.sqlite = new SQLite(options.path, options);
  }

  public async fetchRowsToSync(sync: Sync): Promise<IQueryResult[]> {
    return await fetchRowsToSync(this.sqlite, sync);
  }

  public async updateSyncedRows(syncRow: SyncRow): Promise<void> {
    return await updateSyncedRow(this.sqlite, syncRow);
  }
}
