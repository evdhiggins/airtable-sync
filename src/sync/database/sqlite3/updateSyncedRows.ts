import SyncRowClass from "src/classes/SyncRow.class";
import * as SQlite from "better-sqlite3";

const cleanForSql = (str: string): string => str.replace(/[^a-zA-Z_]/g, "");

export default async (sqlite: any, syncRow: SyncRowClass): Promise<void> => {
  const tableName = cleanForSql(syncRow.localTable);
  const syncColumnName = cleanForSql(syncRow.syncFlag.columnName);
  const airtableIdColumnName = cleanForSql(syncRow.localIdColumns.recordId);
  const primaryKeyColumnName = cleanForSql(syncRow.localIdColumns.primaryKey);

  const sql = `UPDATE ${tableName} SET ${syncColumnName}=?, ${airtableIdColumnName}=? WHERE ${primaryKeyColumnName}=?;`;

  const stmt: any = (sqlite as SQlite).prepare(sql);
  stmt.run([syncRow.syncFlag.false, syncRow.recordId, syncRow.primaryKey]);
};
