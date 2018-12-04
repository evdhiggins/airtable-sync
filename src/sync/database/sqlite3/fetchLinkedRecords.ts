import * as SQlite from "better-sqlite3";
import { IQueryResult, IColumn } from "src/types";

// tslint:disable-next-line
const cleanForSql = (str: string): string => str.replace(/[^a-zA-Z_0-9]/g, "");

export default async (sqlite: any, column: IColumn): Promise<IColumn> => {
  let params: string[] = [];
  if (column.multipleRecords && Array.isArray(column.value)) {
    params = column.value;
  } else {
    params = [column.value];
  }
  const placeholders: string = params.map(() => "?").join(",");
  const sql: string = `
SELECT
    ${cleanForSql(column.linkedRecordId)}

  FROM ${cleanForSql(column.linkedTableName)}
  WHERE ${cleanForSql(column.linkedColumnName)} IN
    (${placeholders})
    AND ${cleanForSql(column.linkedRecordId)} IS NOT NULL;
    `;
  const rows: IQueryResult[] = (sqlite as SQlite).prepare(sql).all(params);
  return Object.assign({}, column, {
    value: rows.map((row) => row[column.linkedRecordId]),
  });
};
