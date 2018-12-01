import SyncRowClass from "src/classes/SyncRow.class";
import * as SQlite from "better-sqlite3";

// tslint:disable-next-line
const cleanForSql = (str: string): string => str.replace(/[^a-zA-Z_0-9]/g, "");

export default async (sqlite: any, syncRow: SyncRowClass): Promise<void> => {
  const tableName: string = cleanForSql(syncRow.localTable);
  const syncColumnName: string = cleanForSql(syncRow.syncFlag.columnName);
  const airtableIdColumnName: string = cleanForSql(
    syncRow.localIdColumns.recordId,
  );
  const primaryKeyColumnName: string = cleanForSql(
    syncRow.localIdColumns.primaryKey,
  );

  const sql: string = `UPDATE ${tableName} SET ${syncColumnName}=?, ${airtableIdColumnName}=? WHERE ${primaryKeyColumnName}=?;`;

  const stmt: any = (sqlite as SQlite).prepare(sql);
  stmt.run([syncRow.syncFlag.false, syncRow.recordId, syncRow.primaryKey]);
};
