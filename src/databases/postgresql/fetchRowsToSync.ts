import * as PGP from 'pg-promise';
import { QueryResult } from "../../types";
import { LocalSchema } from "../../interfaces/ISchema";
import { Column } from "../../types";

export default (
  pg: PGP.IDatabase<any>, schema: LocalSchema, columns: Column[]
): Promise<QueryResult[]> => {

  const dbColumns: string[] = columns.map(column => column.localColumn);
  if (!dbColumns.includes(schema.idColumns.local)) {
    dbColumns.push(schema.idColumns.local);
  }
  if (!dbColumns.includes(schema.idColumns.airtable)) {
    dbColumns.push(schema.idColumns.airtable);
  }
  const preparedColumns: string[] = dbColumns.map(PGP.as.name);
  const sql: string = `
SELECT ${preparedColumns.join(",")}
FROM $[tableName:name]
WHERE $[syncColumnName:name] = $[syncFlagTrue]
`;
  return pg.any(sql, {
    tableName: schema.tableName,
    syncColumnName: schema.syncFlag.columnName,
    syncFlagTrue: schema.syncFlag.true
  })
};
