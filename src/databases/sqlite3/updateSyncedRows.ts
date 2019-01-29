import * as SQlite from "better-sqlite3";
import { LocalSchema } from "../../interfaces/ISchema";

// tslint:disable-next-line
const cleanForSql = (str: string): string => str.replace(/[^a-zA-Z_0-9]/g, "");

export default async (
  sqlite: any,
  schema: LocalSchema,
  row: any
): Promise<void> => {
  const tableName: string = cleanForSql(schema.tableName);
  const syncColumnName: string = cleanForSql(schema.syncFlag.columnName);
  const airtableIdColumnName: string = cleanForSql(schema.idColumns.airtable);
  const primaryKeyColumnName: string = cleanForSql(schema.idColumns.local);

  const localId: string = row[schema.idColumns.local];
  const airtableId: string = row[schema.idColumns.airtable];

  const sql: string = `UPDATE ${tableName} SET ${syncColumnName}=?, ${airtableIdColumnName}=? WHERE ${primaryKeyColumnName}=?;`;

  const stmt: any = (sqlite as SQlite).prepare(sql);
  stmt.run([schema.syncFlag.false, airtableId, localId]);
};
