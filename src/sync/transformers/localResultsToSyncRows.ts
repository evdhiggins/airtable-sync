import { ISync, IQueryResult, SyncRow } from "../../types";

/**
 * Create an array of SyncRows from a sync object and an array of query results
 */
export default (sync: ISync, rows: IQueryResult[]): SyncRow[] =>
  rows.map((row) => new SyncRow(sync, row));
