import { IColumn, IDatabase, IQueryResult, IConfigSync } from "src/types";
import SyncBase from "./SyncBase.class";
import Sync from "./Sync.class";

export default class extends SyncBase {
  /**
   * The airtable row (record) id value
   */
  public recordId: string;

  /**
   * The local datastore primary key value
   */
  public primaryKey: number | string;

  constructor(sync: Sync, database: IDatabase, row: IQueryResult) {
    super((sync as unknown) as IConfigSync);
    this.database = database;
    this.recordId = row[sync.localIdColumns.recordId];
    this.primaryKey = row[sync.localIdColumns.primaryKey];
    this.columns = sync.columns.map((c) => {
      const column: IColumn = Object.assign({}, c);
      column.value =
        typeof column.prepare === "function"
          ? column.prepare(row[column.localColumn])
          : row[column.localColumn];
      return column;
    });
  }
}
