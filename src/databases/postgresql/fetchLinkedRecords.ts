import * as PGP from 'pg-promise';
import { QueryResult } from "../../types";
import { LinkedColumnDetails } from "../../interfaces/ISyncColumn";

export default async (
  pg: PGP.IDatabase<any>,
  { multipleRecords, tableName, lookupColumn, returnColumn }: LinkedColumnDetails,
  columnValue: any
): Promise<any[]> => {
  let params: string[] = [];
  if (multipleRecords && Array.isArray(columnValue)) {
    params = columnValue;
  } else {
    params = [columnValue];
  }
  const sql: string = `
SELECT $[returnColumn:name]
FROM $[tableName:name]
WHERE $[lookupColumn:name] IN ($[params:csv])
  AND $[returnColumn:name] IS NOT NULL;
    `;

  const rows: QueryResult[] = await pg.any(sql, { tableName, returnColumn, params, lookupColumn });
  return rows.map(row => row[returnColumn]);
};
