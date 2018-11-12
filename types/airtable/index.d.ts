// Type definitions for airtable 0.5.7
// Project: https://github.com/airtable/airtable.js
// Definitions by: Evan Higgins <https://github.com/evdhiggins>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace Airtable {
  interface AirtableConfig {
    /**
     * The api must be included in the configuration object or found in process.env.AIRTABLE_API_KEY
     */
    apiKey?: string;

    /**
     * The API endpoint to hit. You might want to override it if you are using an API proxy (e.g. runscope.net) to debug your API calls
     */
    endpointUrl?: string;

    /**
     *  The timeout in milliseconds for requests. The default is 5 minutes (300000)
     */
    requestTimeout?: number;

    allowUnauthorizedSsl?: boolean;
    noRetryIfRateLimited?: boolean;
  }

  interface Record {
    /**
     * An object of the record's values. Only fields containing a value will be included — empty fields are omitted.
     */
    readonly fields: Fields;

    /**
     * Deletes the corrisponding record from Airtable. The deleted record is passed into the resolved promise.
     */
    destroy(): Promise<Record>;

    /**
     * Deletes the corrisponding record from Airtable. The callback receives two parameters: An error object if an error occurred (otherwise, `null`) and the deleted record.
     */
    destroy(done: Callback): void;

    /**
     * Returns the record's Airtable ID. This value cannot be modified or set.
     */
    getId(): string;

    /**
     * Returns the field value for the requested columnName. Equivalent to `record.fields[columnName]`
     * @param columnName
     */
    get(columnName: string): string;

    /**
     * Sets specified columnName record field to the specified value. This change is not saved until `record.save()` is called.
     * @param columnName The name of the field to be updated
     * @param columnValue The new field value
     */
    set(columnName: string, columnValue: any): void;

    /**
     * Saves all changes to the record object. Returns a promise that resolves with the updated record.
     */
    save(): Promise<Record>;

    /**
     * Saves all changes to the record object.
     * @param done A callback function that is passed two parameters: An error object if an error occurred (otherwise, `null`) and the deleted record.
     */
    save(done: Callback): void;
  }

  interface RecordData {
    [index: string]: any;
  }
  interface Fields extends RecordData {}

  interface AirtableError {
    /**
     * Error code
     */
    readonly error: string;

    /**
     * Descriptive error message
     */
    readonly message: string;

    /**
     * HTTP status code
     */
    readonly statusCode: number;

    /**
     * Concatenates the HTTP status code, error code, and error message into a single string.
     */
    toString(): string;
  }

  interface SortObject {
    /**
     * The field by which to sort
     */
    field: string;
    /**
     * The direction to sort by. Default is 'asc'
     */
    direction?: 'asc' | 'desc';
  }
  interface SelectParams {
    /**
     * An array of field names. Only fields in this array will be included in the response. If all fields aren't needed this parameter can be used to reduce the amount of data transferred.
     */
    fields?: string[];

    /**
     * A formula used to filter records. The formula will be evaluated for each record, and if the result is not `0`, `false`, `""`, `NaN`, `[]`, or `#Error!` the record will be included in the response.
     *
     * If combined with view, only records in that view which satisfy the formula will be returned.
     */
    filterByFormula?: string;

    /**
     * The maximum total number of records that will be returned. If this value is larger than pageSize (default 100), multiple pages will be needed to reach the total.
     */
    maxRecords?: number;

    /**
     * The number of records returned in each request. Must be less than or equal to 100. Default is 100.
     */
    pageSize?: number;

    /**
     * A list of sort objects that specifies how the records will be ordered.
     *
     * If the view parameter is set, the returned records in that view will be sorted by these fields.
     */
    sort?: SortObject[];

    /**
     * The name or ID of a view in the table. If set, only the records in that view will be returned. The records will be sorted according to the order of the view.
     */
    view?: string;

    /**
     * The format used for cell values. Must be either 'json' or 'string'.
     */
    cellFormat?: 'json' | 'string';

    /**
     * The time zone that should be used to format dates. Required when using "string" as the `cellFormat`.
     */
    timeZone?: string;

    /**
     * The user locale that should be used to format dates. Required when using "string" as the `cellFormat`.
     */
    userLocale?: string;
  }

  interface PageCallback {
    (records: Record[], next: () => void): void;
  }

  interface Query {
    /**
     * Returns the first page of results matching the query.
     */
    firstPage(): Promise<Record[]>;

    /**
     * Passes the first page of results into the provided callback function
     * @param done Callback function that receives two parameters: An error object if an error occurred (otherwise, `null`) and array of matching records.
     */
    firstPage(done: Callback): void;

    /**
     *
     * @param pageCallback A function that is called for every page of results. Receives two parameters: an array of matching records, and the nextPage callback function.
     */
    eachPage(pageCallback: PageCallback): Promise<void>;

    /**
     *
     * @param pageCallback A function that is called for every page of results. Receives two parameters: an array of matching records, and the nextPage callback function.
     * @param done A callback function that is called once there are no more pages
     */
    eachPage(pageCallback: PageCallback, done: () => void): void;

    /**
     * Returns a promise for all records matching the query.
     *
     * Behind the scenes `Query.eachPage` is called, concatenating all records. The returned promise is resolved with the resulting array.
     */
    all(): Promise<Record[]>;

    /**
         * Passes all records matching the query into a callback.
         *
         Behind the scenes `Query.eachPage` is called, concatenating all records.
         * @param done A callback function that receives two parameters: An error object if an error occurred (otherwise, `null`) and an array containing all matching records
         */
    all(done: Callback): void;
  }

  interface Callback {
    (err: AirtableError | null, record: Record): void;
  }

  interface Base {
    /**
     * Returns a Table object for the specified table
     * @param tableName Accepts either the Table Name or the Table ID
     */
    (tableName: string): Table;

    /**
     * Returns the base's ID
     */
    getId(): string;
  }

  interface Table {
    /**
     * Contains the table name or ID; whichever was used when initializing the table object.
     */
    readonly name: string;

    /**
     * Retrieve a specific record by ID. Returns a promise that resolves with the requested record if it exists, otherwise `null`.
     * @param recordId The ID of the requested record.
     */
    find(recordId: string): Promise<Record>;

    /**
     * Retrieve a specific record by ID.
     * @param recordId The ID of the requested record.
     * @param done A callback function that recieves two parameters: An error object if an error occurred (otherwise, `null`) and the requested record.
     */
    find(recordId: string, done: Callback): void;

    /**
     * Returns a query object that can be used to fetch results by calling either `eachPage`, `firstPage`, or `all`.
     * @param params An object containing any filter or result settings
     */
    select(params: SelectParams): Query;
    create(recordData: RecordData): Promise<Record>;
    create(recordData: RecordData, done: Callback): void;
    update(recordId: string, recordData: RecordData): Promise<Record>;
    update(
      recordId: string,
      recordData: RecordData,
      done: Callback,
    ): Promise<Record>;
    destroy(recordId: string): Promise<Record>;
    destroy(recordId: string, done: Callback): Promise<Record> | void;
    replace(recordId: string, recordData: RecordData): void;
    replace(
      recordId: string,
      recordData: RecordData,
      done: Callback,
    ): Promise<Record>;
  }
}
declare class Airtable {
  /**
   * Override global configuration options per instance
   * @param config An airtable configuration object
   */
  constructor(config?: Airtable.AirtableConfig);

  /**
   * Set the Airtable configuration options globally
   * @param config An airtable configuration object
   */
  static configure(config: Airtable.AirtableConfig): void;

  /**
   *
   * @param baseId The ID for the Airtable base
   */
  base(baseId: string): Airtable.Base;
}

export = Airtable;
