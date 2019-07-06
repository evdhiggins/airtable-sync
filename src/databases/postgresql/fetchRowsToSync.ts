import * as PGP from 'pg-promise';
import { QueryResult } from "../../types";
import { LocalSchema } from "../../interfaces/ISchema";
import { Column } from "../../types";

export default async (
  pg: PGP.IDatabase<any>, schema: LocalSchema, columns: Column[]
): Promise<QueryResult[]> => {

  const dbColumns: string[] = columns.map(PGP.as.name);
  if (!dbColumns.includes(schema.idColumns.local)) {
    dbColumns.push(PGP.as.name(schema.idColumns.local));
  }
  if (!dbColumns.includes(schema.idColumns.airtable)) {
    dbColumns.push(PGP.as.name(schema.idColumns.airtable));
  }
  const sql: string = `
SELECT ${dbColumns.join(", ")}
FROM $[tableName:name]
WHERE $[syncColumnName:name] = $[syncFlagTrue]`;
  return pg.any(sql, {
    tableName: schema.tableName,
    syncColumnName: schema.syncFlag.columnName,
    syncFlagTrue: schema.syncFlag.true
  })
};
