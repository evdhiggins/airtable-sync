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
   * Perform any desired modifications on synced data prior to transmission
   * @param cell The column value returned from the local table query
   */
  prepare?: (cell: any) => any;
}

export interface ISync {
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
   * Columns to sync
   */
  columns: IColumn[];
}

export interface IConfig {
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
   * Syncs to perform
   */
  syncs: ISync[];
}

export interface ILocalQuery {
  /**
   * The name of the table used in the query
   */
  tableName: string;

  /**
   * An array of the column names used in the query
   */
  columns: string[];
}

/**
 * A flattened row of results from a query
 */
export interface IQueryResult {
  [index: string]: any;
}

/**
 * An object used to update local db rows after syncing
 */
export interface IUpdateQuery {
  /**
   * The name of the table used in the query
   */
  tableName: string;
  rows: IQueryResult[];
}

export interface IDatabase {
  /**
   * Fetch all rows to be pushed to Airtable
   * @param localQuery
   */
  fetchRowsToSync(localQuery: ILocalQuery): Promise<IQueryResult[]>;

  /**
   * Update all synced rows, adding Airtable record ID's and updating flags
   * @param updateQuery
   */
  updateSyncedRows(localQuery: IUpdateQuery): Promise<void>;
}
