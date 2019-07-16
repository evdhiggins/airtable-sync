import * as SQlite from "better-sqlite3";
import { QueryResult } from "../../types";
import { LinkedColumnDetails } from "../../interfaces/ISyncColumn";

// tslint:disable-next-line
const cleanForSql = (str: string): string => str.replace(/[^a-zA-Z_0-9]/g, "");

export default async (
  sqlite: any,
  linkDetails: LinkedColumnDetails,
  columnValue: any
): Promise<any[]> => {
  let params: string[] = [];

  // get all linked record details
  const {
    multipleRecords,
    tableName,
    lookupColumn,
    returnColumn
  } = linkDetails;

  // wrap lookup values in an array
  if (multipleRecords && Array.isArray(columnValue)) {
    params = columnValue;
  } else {
    params = [columnValue];
  }

  // prepare query
  const placeholders: string = params.map(() => "?").join(",");
  const sql: string = `
SELECT
    ${cleanForSql(returnColumn)}

  FROM ${cleanForSql(tableName)}
  WHERE ${cleanForSql(lookupColumn)} IN
    (${placeholders})
    AND ${cleanForSql(returnColumn)} IS NOT NULL;
    `;

  // run query
  const rows: QueryResult[] = (sqlite as SQlite.Database).prepare(sql).all(params);
  return rows.map(row => row[returnColumn]);
};
