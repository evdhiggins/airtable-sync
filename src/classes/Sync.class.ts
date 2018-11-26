import { IConfigSync, IColumn, IQueryResult } from "src/types";
import SyncBase from "./SyncBase.class";
import SyncRow from "./SyncRow.class";

export default class extends SyncBase {
  constructor(sync: IConfigSync) {
    super(sync);
  }

  /**
   * Generate an array of SyncRows based on Sync data and the QueryResults passed as an argument
   * @param results
   */
  public getSyncRows(results: IQueryResult[]): SyncRow[] {
    return results.map((result) => {
      return new SyncRow(this, this.database, result);
    });
  }
}
