import * as SQlite from "better-sqlite3";
import { QueryResult } from "../../types";
import { LocalSchema } from "../../interfaces/ISchema";
import { Column } from "../../types";

// tslint:disable-next-line
const cleanForSql = (str: string): string => str.replace(/[^a-zA-Z_0-9]/g, "");

export default async (
  sqlite: any,
  schema: LocalSchema,
  columns: Column[]
): Promise<QueryResult[]> => {
  const dbColumns: string[] = columns.map(column =>
    cleanForSql(column.localColumn)
  );

  if (!dbColumns.includes(schema.idColumns.local)) {
    dbColumns.push(schema.idColumns.local);
  }

  if (!dbColumns.includes(schema.idColumns.airtable)) {
    dbColumns.push(schema.idColumns.airtable);
  }

  const tableName: string = cleanForSql(schema.tableName);
  const syncColumnName: string = cleanForSql(schema.syncFlag.columnName);

  let sql: string = `SELECT ${dbColumns.join(
    ", "
  )} FROM ${tableName} WHERE ${syncColumnName} = ?`;
  const stmt: any = (sqlite as SQlite).prepare(sql);
  const rows: QueryResult[] = stmt.all([schema.syncFlag.true]);

  return rows;
};
