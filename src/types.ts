import Sync from "./classes/Sync.class";
import SyncRow from "./classes/SyncRow.class";

export interface IColumn {
  /**
   * The column name in the local table
   */
  localColumn: string;

  /**
   * The Airtable column name
   */
  airtableColumn: string;

  /**
   * The value that is being synced
   */
  value?: any;

  /**
   * Perform any desired modifications on synced data prior to transmission
   * @param cell The column value returned from the local table query
   */
  prepare?: (cell: any) => any;

  /**
   * Flags column as LinkedColumn
   */
  linkedColumn?: true;

  /**
   * The local table name for the linked record. Used ot lookup the locally saved record ID
   */
  linkedTableName?: string;

  /**
   * The local table column name for the linked record. Used to find the correct record ids
   */
  linkedColumnName?: string;

  /**
   * The local table column name for the airtable record id in the linked table.
   */
  linkedRecordId?: string;

  /**
   * If Airtable column allows multiple linked records. If set to `True`, the column value & uploaded value are treated as arrays.
   */
  multipleRecords?: boolean;
}

export type IConfigSync = {
  /**
   * The local table name.
   */
  localTable: string;

  /**
   * The airtable API key to use. If not specified the config api key will be used
   */
  airtableApiKey?: string;

  /**
   * The airtable Base ID used in this sync. If not specified the config base id will be used
   */
  airtableBaseId?: string;

  /**
   * The name or table ID of the Airtable table used in this sync. If not specified the config table id will be used
   */
  airtableTableId?: string;

  /**
   * The name of the database class used when performing local queries. Default: sqlite3
   */
  databaseClass?: string;

  databaseOptions?: { [index: string]: any };
  localIdColumns?: {
    recordId: string;
    primaryKey: string;
  };
  syncFlag?: {
    columnName: string;
    true: boolean | number | string;
    false: boolean | number | string;
  };

  /**
   * Determine if rows lacking a recordId will attempt to be found via primary key.
   * Requires primary key column to be included in columns array. Default false.
   */
  airtableLookupByPrimaryKey?: boolean;

  /**
   * Columns to sync
   */
  columns: IColumn[];
};

export type IConfig = {
  /**
   * The airtable API key to use. If not specified the .env api key will be used
   */
  airtableApiKey?: string;

  /**
   * The airtable Base ID used in this sync. If not specified the .env base id will be used
   */
  airtableBaseId?: string;

  /**
   * The name or table ID of the Airtable table used in this sync. If not specified the .env table id will be used
   */
  airtableTableId?: string;

  /**
   * The name of the database class used when performing local queries. Default: sqlite3
   */
  databaseClass?: string;
  /**
   * An object containing any configurations to be passed to the database class constructor function
   */
  databaseOptions?: any;

  /**
   * The column names within the local datastore for the local primary key & the Airtable record id
   */
  localIdColumns?: {
    /**
     * The local datastore column name for the Airtable record id
     */
    recordId?: string;

    /**
     * The local datastore column name for the table's primary key
     */
    primaryKey?: string;
  };

  /**
   * Configure the local column used to denote a row as needing to be synced or not
   */
  syncFlag?: {
    /**
     * The column name for the syncFlag
     */
    columnName: string;

    /**
     * The syncFlag column value when a sync is required
     */
    true: boolean | number | string;

    /**
     * The syncFlag column value when no sync is required
     */
    false: boolean | number | string;
  };

  /**
   * Determine if rows lacking a recordId will attempt to be found via primary key.
   * Requires primary key column to be included in columns array. Default false.
   */
  airtableLookupByPrimaryKey?: boolean;

  /**
   * Syncs to perform
   */
  syncs: IConfigSync[];
};

/**
 * A flattened row of results from a query
 */
export type IQueryResult = {
  [index: string]: any;
};

export interface IDatabase {
  /**
   * Fetch all rows to be pushed to Airtable
   * @param localQuery
   */
  fetchRowsToSync(sync: Sync): Promise<IQueryResult[]>;

  /**
   * Fetch all airtable record ID's for an array of linked columns
   * If no record id is found no value is returned for the respective linkedColumn
   * @param linkedColumns
   */
  fetchLinkedRecords(linkedColumn: IColumn): Promise<IColumn>;

  /**
   * Update all synced rows, adding Airtable record ID's and updating flags
   * @param updateQuery
   */
  updateSyncedRows(syncRow: SyncRow): Promise<void>;
}

export type AirtableConfig = {
  apiKey?: string;
  baseId?: string;
  tableId?: string;
};

export type DatabaseConfig = {
  name: "sqlite3";
  options: {
    [index: string]: any;
  };
};

export type Config = {
  airtable: AirtableConfig;
  database: DatabaseConfig;
};

export type Column = {
  databaseColumn: string;
  airtableColumn: string;
  prepare?: (cell: any) => any;
  linkedColumn?: true;
  linkedTableName?: string;
  multipleRecords?: boolean;
};

export type Schema = {
  database: {
    tableName: string;
    syncFlag: {
      columnName: string;
      true: boolean | number | string;
      false: boolean | number | string;
    };
    idColumns: {
      database: string;
      airtable: string;
    };
  };

  airtable: {
    tableId?: string;
    baseId?: string;
    apiKey?: string;
    lookupByPrimaryKey?: true;
  };

  columns: Column[];
};

export interface ISyncMaster {
  addSync(schema: Schema): this;
  config(): Config;
  setConfig(config: Config): this;
  run(): Promise<this>;
}
