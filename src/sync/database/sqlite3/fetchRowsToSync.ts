import * as SQlite from "better-sqlite3";
import { IQueryResult } from "src/types";
import Sync from "../../../classes/Sync.class";

// tslint:disable-next-line
const cleanForSql = (str: string): string => str.replace(/[^a-zA-Z_0-9]/g, "");

export default async (sqlite: any, sync: Sync): Promise<IQueryResult[]> => {
  const selectColumns: string[] = sync.columns.map((column) =>
    cleanForSql(column.localColumn),
  );

  if (!selectColumns.includes(sync.localIdColumns.primaryKey)) {
    selectColumns.push(sync.localIdColumns.primaryKey);
  }

  if (!selectColumns.includes(sync.localIdColumns.recordId)) {
    selectColumns.push(sync.localIdColumns.recordId);
  }

  const tableName: string = cleanForSql(sync.localTable);
  const syncColumnName: string = cleanForSql(sync.syncFlag.columnName);

  let sql: string = `SELECT ${selectColumns.join(
    ", ",
  )} FROM ${tableName} WHERE ${syncColumnName} = ?`;
  const stmt: any = (sqlite as SQlite).prepare(sql);
  const rows: IQueryResult[] = stmt.all([sync.syncFlag.true]);

  return rows;
};
