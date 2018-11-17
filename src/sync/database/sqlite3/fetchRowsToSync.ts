import * as SQlite from "better-sqlite3";
import { IQueryResult } from "src/types";
import Sync from "../../../classes/Sync.class";

export default async (sqlite: any, sync: Sync): Promise<IQueryResult[]> => {
  const params: Array<boolean | number | string> = [];
  const columnPlaceholders: string[] = sync.columns.map(column => {
    params.push(column.localColumn);
    return "?";
  });

  if (!params.includes(sync.localIdColumns.primaryKey)) {
    params.push(sync.localIdColumns.primaryKey);
    columnPlaceholders.push("?");
  }

  if (!params.includes(sync.localIdColumns.recordId)) {
    params.push(sync.localIdColumns.recordId);
    columnPlaceholders.push("?");
  }

  params.push(sync.localTable);
  params.push(sync.syncFlag.columnName);
  params.push(sync.syncFlag.true);

  let sql: string = `SELECT ${columnPlaceholders.join(
    ", "
  )} FROM ? WHERE ? = ?`;

  const stmt: any = (sqlite as SQlite).prepare(sql);
  const rows: IQueryResult[] = stmt.all(params);

  return rows;
};
