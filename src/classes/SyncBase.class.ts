import { IConfigSync, IColumn, IDatabase } from "src/types";

export default class {
  public database: IDatabase;

  /**
   * The local table name.
   */
  public localTable: string;

  /**
   * The airtable API key to use. If not specified the config api key will be used
   */
  public airtableApiKey: string;

  /**
   * The airtable Base ID used in this sync. If not specified the config base id will be used
   */
  public airtableBaseId: string;

  /**
   * The name or table ID of the Airtable table used in this sync. If not specified the config table id will be used
   */
  public airtableTableId: string;

  /**
   * The name of the database class used when performing local queries. The class must fully implement IDatabase. Defaults to `sqlite3`
   */
  public databaseClass: string;

  /**
   * An object containing any configurations to be passed to the database class constructor function
   */
  public databaseOptions: any;

  /**
   * The column names within the local datastore for the local primary key & the Airtable record id
   */
  public localIdColumns: {
    /**
     * The local datastore column name for the Airtable record id
     */
    recordId: string;
    /**
     * The local datastore column name for the table's primary key
     */
    primaryKey: string;
  };

  /**
   * Configure the local column used to denote a row as needing to be synced or not
   */
  public syncFlag: {
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
   * Columns to sync
   */
  public columns: IColumn[];

  constructor(sync: IConfigSync) {
    this.localTable = sync.localTable;
    this.airtableApiKey = sync.airtableApiKey;
    this.airtableBaseId = sync.airtableBaseId;
    this.airtableTableId = sync.airtableTableId;
    this.databaseClass = sync.databaseClass;
    this.databaseOptions = sync.databaseOptions;
    this.localIdColumns = sync.localIdColumns;
    this.syncFlag = sync.syncFlag;
    this.columns = sync.columns;
  }
}
