import { Config, Column, QueryResult, SyncRunReport } from "../types";
import ISync from "../interfaces/ISync";
import assertionTester from "../assertionTester";
import ISchema, {
  LocalSchema,
  AirtableSchema,
  Filter
} from "../interfaces/ISchema";
import IDatabase from "../interfaces/IDatabase";
import SycnRowFactory, { SyncRow } from "./SyncRow";
import { AirtableSync } from "./AirtableSync";

function sleep(miliseconds: number): Promise<any> {
  return new Promise(res => {
    setTimeout(() => res(), miliseconds);
  });
}

interface IPreparedFilter extends Filter {
  removeFromAirtable: boolean;
  skipSync: boolean;
  actions: Filter.ActionFunction[];
  match: Filter.MatchFunction;
}

type FilterResult = {
  removeFromAirtable: boolean;
  skipSync: boolean;
  actions: Filter.ActionFunction[];
  removeFromAirtableCallbacks: Filter.RemoveFromAirtableCallback[];
};

export class Sync implements ISync {
  private _local: LocalSchema;
  private _airtable: AirtableSchema;
  private _columns: Column[];
  private _db: IDatabase;
  private _at: AirtableSync;
  private _name: string;
  private _filters: IPreparedFilter[];

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
    assertionTester("schema", "apiKey", this._airtable.apiKey);
    assertionTester("schema", "baseId", this._airtable.baseId);
    assertionTester("schema", "tableId", this._airtable.tableId);

    // verify LocalSchema inputs
    assertionTester("schema", "localSchema", schema.local);
    assertionTester("schema", "tableName", schema.local.tableName);
    assertionTester("schema", "syncFlag", schema.local.syncFlag);
    assertionTester("schema", "idColumns", schema.local.idColumns);

    this._local = schema.local;

    if (schema.filters) {
      assertionTester("schema", "filters", schema.filters);
      schema.filters.forEach(filter =>
        assertionTester("schema", "filter", filter)
      );
      this._filters = this.prepareFilters(schema.filters);
    } else {
      this._filters = [];
    }

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
      const filterResults: FilterResult = this.evaluateFilters(row);

      if (!filterResults.skipSync) {
        this._at.update(row).then(() => this.updateLocalDb(row));
      }

      if (filterResults.removeFromAirtable) {
        this._at.delete(row).then(deletedRow => {
          filterResults.removeFromAirtableCallbacks.forEach(fn =>
            fn(deletedRow)
          );
        });
      }

      filterResults.actions.forEach(fn => fn(row.localRow()));

      // wait 650 miliseconds between each call to avoid ever hitting the 5 calls / second api limit
      // each airtable update call might call the Airtable api up to 3x,
      // meaning the max call rate is limited to ~4.6x / second
      await sleep(650);
    }
    // close open connection(s)
    await this._db.close();

    const name: string =
      this._name || `${this._local.tableName} / ${this._airtable.tableId}`;
    return {
      name,
      rows: this._rows.length
    };
  }

  private evaluateFilters(row: SyncRow): FilterResult {
    const rowData: QueryResult = row.localRow();
    const result: FilterResult = {
      removeFromAirtable: false,
      skipSync: false,
      removeFromAirtableCallbacks: [],
      actions: []
    };
    this._filters.forEach(filter => {
      if (filter.match(rowData)) {
        // a row will be removed if ANY filters match and require removal
        result.removeFromAirtable =
          filter.removeFromAirtable || result.removeFromAirtable;

        // a row will not be synced if ANY filters match and require no sync
        result.skipSync = filter.skipSync || result.skipSync;

        // all matching remove callbacks will be called
        if (filter.removeFromAirtableCallback) {
          result.removeFromAirtableCallbacks.push(
            filter.removeFromAirtableCallback
          );
        }

        // all matching actions will be called
        result.actions = result.actions.concat(filter.actions);
      }
    });
    return result;
  }

  private prepareFilters(filters: Filter[]): IPreparedFilter[] {
    return filters.reduce(
      (acc, filter) => {
        const prepFilter: any = Object.assign({}, filter);

        // generate a matchFnFactory that will be passed the current
        // value of filter.match and will return a function that accepts
        // the filter value
        let matchFnFactory: any;
        let stringMatch: boolean = false;
        if (filter.match instanceof RegExp) {
          matchFnFactory = (reg: RegExp) => (v: string) => reg.test(v);
          stringMatch = true;
        } else if (typeof filter.match === "string") {
          matchFnFactory = (matchStr: string) => (v: string) => matchStr === v;
          stringMatch = true;
        } else {
          matchFnFactory = (fn: any) => fn;
        }
        const matchFunc: any = matchFnFactory(filter.match);

        // assign to the final filter.match value a function that receives
        // the full QueryResult row, evaluates if the column is available,
        // and calls the generated matchFunc with the column / row
        prepFilter.match = (row: QueryResult) => {
          if (filter.type === "column") {
            const value: string = row[filter.localColumn];
            if (typeof value === "undefined") {
              // warn user if match column doesn't exist in data
              console.warn(
                `Filter column (${filter.localColumn}) not found in row:`
              );
              console.warn(row);

              // return match = `false` if specified column doesn't exist
              return false;
            }
            return matchFunc(row[filter.localColumn]);
          }
          return matchFunc(stringMatch ? JSON.stringify(row) : row);
        };

        prepFilter.removeFromAirtable = prepFilter.actions.includes(
          "removeFromAirtable"
        );
        prepFilter.skipSync =
          prepFilter.actions.includes("skipSync") ||
          prepFilter.removeFromAirtable;
        prepFilter.actions = prepFilter.actions.filter(
          (f: Filter.Action) => typeof f === "function"
        );
        acc.push(prepFilter as IPreparedFilter);
        return acc;
      },
      [] as IPreparedFilter[]
    );
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

  private async updateLocalDb(row: SyncRow): Promise<this> {
    await this._db.updateSyncedRow(this._local, row.localRow());
    return this;
  }
}

export default function(schema: ISchema, config: Config): Sync {
  return new Sync(schema, config);
}
