import * as SQLite from "better-sqlite3";
import fetchRowsToSync from "./fetchRowsToSync";
import updateSyncedRow from "./updateSyncedRows";
import { IDatabase, IQueryResult, IColumn } from "../../../types";

import Sync from "../../../classes/Sync.class";
import SyncRow from "../../../classes/SyncRow.class";
import fetchLinkedRecords from "./fetchLinkedRecords";

export default class implements IDatabase {
  private sqlite: SQLite;
  constructor(options: any) {
    this.sqlite = new SQLite(options.path, options);
  }

  public async fetchRowsToSync(sync: Sync): Promise<IQueryResult[]> {
    return await fetchRowsToSync(this.sqlite, sync);
  }

  public async fetchLinkedRecords(column: IColumn): Promise<IColumn> {
    return await fetchLinkedRecords(this.sqlite, column);
  }

  public async updateSyncedRows(syncRow: SyncRow): Promise<void> {
    return await updateSyncedRow(this.sqlite, syncRow);
  }
}
