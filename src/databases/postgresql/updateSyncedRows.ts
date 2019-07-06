import * as PGP from "pg-promise";
import { LocalSchema } from "../../interfaces/ISchema";

export default async (
  pg: PGP.IDatabase<any>,
  schema: LocalSchema,
  row: any
): Promise<void> => {
  const sql: string = `
UPDATE $[tableName:name]
SET $[syncColumnName] = $[syncColumnFalse],
  $[airtableIdColumnName:name] = $[airtableId]
WHERE $[primaryKeyColumnName:name] = $[localId];`;

  return pg.none(sql, {
    tableName: schema.tableName,
    syncColumnName: schema.syncFlag.columnName,
    syncColumnFalse: schema.syncFlag.false,
    airtableId: row[schema.idColumns.airtable],
    localId: row[schema.idColumns.local],
    primaryKeyColumnName: schema.idColumns.local,
    airtableIdColumnName: schema.idColumns.airtable,
  })
};
