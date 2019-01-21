import { Config, Column, QueryResult, SyncRunReport } from "../types";
import ISync from "../interfaces/ISync";
import assertionTester from "../assertionTester";
import ISchema, { LocalSchema, AirtableSchema } from "../interfaces/ISchema";
import IDatabase from "../interfaces/IDatabase";
import SycnRowFactory, { SyncRow } from "./SyncRow";
import { AirtableSync } from "./AirtableSync";

function sleep(miliseconds: number): Promise<any> {
  return new Promise(res => {
    setTimeout(() => res(), miliseconds);
  });
}

export class Sync implements ISync {
  private _local: LocalSchema;
  private _airtable: AirtableSchema;
  private _columns: Column[];
  private _db: IDatabase;
  private _at: AirtableSync;
  private _name: string;

  private _rows: SyncRow[];

  /**
   * Create a new sync from a user's schema. If there are any issues
   * processing the schema or any missing fields an AssertionError is
   * thrown
   * @param schema The schema for a new sync
   * @param config The config object belonging to the SyncMaster
   */
  constructor(schema: ISchema, config: Config) {
    assertionTester("schema", "airtableSchema", schema.airtable);

    this._airtable = {
      tableId: schema.airtable.tableId || config.airtable.tableId,
      baseId: schema.airtable.baseId || config.airtable.baseId,
      apiKey: schema.airtable.apiKey || config.airtable.apiKey,
      lookupByPrimaryKey: schema.airtable.lookupByPrimaryKey === true
    };

    // verify AirtableSchema / AirtableConfig inputs
    ["apiKey", "baseId", "tableId"].forEach(key =>
      assertionTester("schema", key, this._airtable[key])
    );

    // verify LocalSchema inputs
    assertionTester("schema", "localSchema", schema.local);
    ["tableName", "syncFlag", "idColumns"].forEach(key =>
      assertionTester("schema", key, schema.local[key])
    );

    this._local = schema.local;
    this._columns = schema.columns;
    this._rows = [];
    this._name = schema.name;
  }

  /**
   * Sets the database for future `getLocalData` and `updateLocalData`
   * calls. Called by SyncMaster
   * @param db
   */
  public setDatabase(db: IDatabase): this {
    this._db = db;
    return this;
  }

  /**
   * Sets the Airtable interface to the Airtable class. Called by
   * SyncMaster
   * @param at
   */
  public setAirtable(at: any): this {
    this._at = at;
    return this;
  }

  /**
   * Performs the full sync
   */
  public async run(): Promise<SyncRunReport> {
    await this.getLocalData();
    for (let row of this._rows) {
      this._at.update(row).then(() => this.updateLocalDb(row));

      // wait 650 miliseconds between each call to avoid ever hitting the 5 calls / second api limit
      // each airtable update call might call the Airtable api up to 3x,
      // meaning the max call rate is limited to ~4.6x / second
      await sleep(650);
    }
    const name: string =
      this._name || `${this._local.tableName} / ${this._airtable.tableId}`;
    return {
      name,
      rows: this._rows.length
    };
  }

  private async getLocalData(): Promise<this> {
    const rows: QueryResult[] = await this._db.getRowsToSync(
      this._local,
      this._columns
    );
    const schema: ISchema = {
      airtable: this._airtable,
      local: this._local,
      columns: this._columns
    };
    this._rows = rows.map(row => SycnRowFactory(row, schema, this._db));
    return this;
  }

  private async updateLocalDb(row: any): Promise<this> {
    await this._db.updateSyncedRow(this._local, row);
    return this;
  }
}

export default function(schema: ISchema, config: Config): Sync {
  return new Sync(schema, config);
}
