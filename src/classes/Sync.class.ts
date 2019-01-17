import { Config, Column, QueryResult } from "../types";
import ISync from "../interfaces/ISync";
import assertionTester from "../assertionTester";
import ISchema, { LocalSchema, AirtableSchema } from "../interfaces/ISchema";
import IDatabase from "../interfaces/IDatabase";
import IAirtable from "../interfaces/IAirtable";
import SycnRowFactory, { SyncRow } from "./SyncRow.class";

function sleep(miliseconds: number): Promise<any> {
  return new Promise((res) => {
    setTimeout(() => res(), miliseconds);
  });
}

export class Sync implements ISync {
  private local: LocalSchema;
  private airtable: AirtableSchema;
  private columns: Column[];
  private db: IDatabase;
  private at: IAirtable;

  private rows: SyncRow[];

  /**
   * Create a new sync from a user's schema. If there are any issues
   * processing the schema or any missing fields an AssertionError is
   * thrown
   * @param schema The schema for a new sync
   * @param config The config object belonging to the SyncMaster
   */
  constructor(schema: ISchema, config: Config) {
    assertionTester("schema", "airtableSchema", schema.airtable);

    this.airtable = {
      tableId: schema.airtable.tableId || config.airtable.tableId,
      baseId: schema.airtable.baseId || config.airtable.baseId,
      apiKey: schema.airtable.apiKey || config.airtable.apiKey,
      lookupByPrimaryKey: schema.airtable.lookupByPrimaryKey === true,
    };

    // verify AirtableSchema / AirtableConfig inputs
    ["apiKey", "baseId", "tableId"].forEach((key) =>
      assertionTester("schema", key, this.airtable[key]),
    );

    // verify LocalSchema inputs
    assertionTester("schema", "localSchema", schema.local);
    ["tableName", "syncFlag", "idColumns"].forEach((key) =>
      assertionTester("schema", key, schema.local[key]),
    );

    this.local = schema.local;
    this.columns = schema.columns;
    this.rows = [];
  }

  /**
   * Sets the database for future `getLocalData` and `updateLocalData`
   * calls. Called by SyncMaster
   * @param db
   */
  public setDatabase(db: IDatabase): this {
    this.db = db;
    return this;
  }

  /**
   * Sets the Airtable interface to the Airtable class. Called by
   * SyncMaster
   * @param at
   */
  public setAirtable(at: any): this {
    this.at = at;
    return this;
  }

  /**
   * Performs the full sync
   */
  public async run(): Promise<void> {
    await this.getLocalData();
    for (let row of this.rows) {
      this.at.update(row).then(() => this.updateLocalDb(row));

      // wait 650 miliseconds between each call to avoid ever hitting the 5 calls / second api limit
      // each airtable update call might call the Airtable api up to 3x,
      // meaning the max call rate is limited to ~4.6x / second
      await sleep(650);
    }
  }

  private async getLocalData(): Promise<this> {
    const rows: QueryResult[] = await this.db.getRowsToSync(
      this.local,
      this.columns,
    );
    const schema: ISchema = {
      airtable: this.airtable,
      local: this.local,
      columns: this.columns,
    };
    this.rows = rows.map((row) => SycnRowFactory(row, schema, this.db));
    return this;
  }

  private async updateLocalDb(row: any): Promise<this> {
    await this.db.updateSyncedRow(this.local, row);
    return this;
  }
}

export default function(schema: ISchema, config: Config): Sync {
  return new Sync(schema, config);
}
