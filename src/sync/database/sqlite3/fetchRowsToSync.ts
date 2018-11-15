import * as SQlite from "better-sqlite3";
import { ILocalQuery, IQueryResult } from "src/types";

export default async (
  sqlite: any,
  localQuery: ILocalQuery,
): Promise<IQueryResult[]> => {
  const params: string[] = [];
  const columnPlaceholders: string[] = localQuery.columns.map((column) => {
    params.push(column);
    return "?";
  });

  params.push(localQuery.tableName);

  let sql: string = `SELECT ${columnPlaceholders.join(
    ", ",
  )} FROM ? WHERE to_sync = 'T'`;

  const stmt: any = (sqlite as SQlite).prepare(sql);
  const rows: IQueryResult[] = stmt.all(params);

  return rows;
};
