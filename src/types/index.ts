import ISchema from "../interfaces/ISchema";
import { Column } from "./Column";

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

export interface ISyncMaster {
  addSync(schema: ISchema): this;
  config(): Config;
  setConfig(config: Config): this;
  run(): Promise<SyncRunReport[]>;
}

export type SyncRunReport = {
  name: string;
  rows: number;
};

export type Column = Column;
