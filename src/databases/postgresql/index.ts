import * as PGP from "pg-promise";
import fetchRowsToSync from "./fetchRowsToSync";
import updateSyncedRow from "./updateSyncedRows";
import fetchLinkedRecords from "./fetchLinkedRecords";

import { QueryResult, Column } from "../../types";
import { LocalSchema } from "../../interfaces/ISchema";
import IDatabase from "../../interfaces/IDatabase";
import { LinkedColumnDetails } from "../../interfaces/ISyncColumn";

export default class implements IDatabase {
  private pg: PGP.IDatabase<any>;
  constructor(options: any) {
    this.pg = PGP()(options.databaseUrl);
  }

  public async getRowsToSync(
    schema: LocalSchema,
    columns: Column[]
  ): Promise<QueryResult[]> {
    return await fetchRowsToSync(this.pg, schema, columns);
  }

  public async fetchLinkedRecords(
    linkDetails: LinkedColumnDetails,
    value: any
  ): Promise<any[]> {
    const values: any[] = await fetchLinkedRecords(
      this.pg,
      linkDetails,
      value
    );
    return values;
  }

  public async updateSyncedRow(schema: LocalSchema, row: any): Promise<void> {
    return await updateSyncedRow(this.pg, schema, row);
  }

  public async close(): Promise<void> {
    return;
  }
}
