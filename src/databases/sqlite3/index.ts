import * as SQLite from "better-sqlite3";
import fetchRowsToSync from "./fetchRowsToSync";
import updateSyncedRow from "./updateSyncedRows";
import fetchLinkedRecords from "./fetchLinkedRecords";

import { QueryResult, Column } from "../../types";
import { LocalSchema } from "../../interfaces/ISchema";
import IDatabase from "../../interfaces/IDatabase";
import { LinkedColumnDetails } from "../../interfaces/ISyncColumn";

export default class implements IDatabase {
  private sqlite: SQLite;
  constructor(options: any) {
    this.sqlite = new SQLite(options.path, options);
  }

  public async getRowsToSync(
    schema: LocalSchema,
    columns: Column[]
  ): Promise<QueryResult[]> {
    return await fetchRowsToSync(this.sqlite, schema, columns);
  }

  public async fetchLinkedRecords(
    linkDetails: LinkedColumnDetails,
    value: any
  ): Promise<any[]> {
    const values: any[] = await fetchLinkedRecords(
      this.sqlite,
      linkDetails,
      value
    );
    return values;
  }

  public async updateSyncedRow(schema: LocalSchema, row: any): Promise<void> {
    return await updateSyncedRow(this.sqlite, schema, row);
  }
}
