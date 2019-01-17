import ISchema from "./interfaces/ISchema";

/**
 * A row of results from a query
 */
export type QueryResult = {
  [index: string]: any;
};

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
  localColumn: string;
  airtableColumn: string;
  prepare?: (cell: any) => any;
  linkedColumn?: boolean;
  linkedTableName?: string;
  linkedLookupColumn?: string;
  linkedReturnColumn?: string;
  multipleRecords?: boolean;
  value?: any;
};

export interface ISyncMaster {
  addSync(schema: ISchema): this;
  config(): Config;
  setConfig(config: Config): this;
  run(): Promise<void>;
}
