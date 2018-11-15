import * as Sqlite from "better-sqlite3";
import { ISync, IConfig, ILocalQuery, IQueryResult } from "../types";

export const validSync: ISync = {
  localTable: "table_name",
  columns: [
    {
      airtableColumn: "Column one",
      localColumn: "column_one",
    },
    {
      airtableColumn: "Column two",
      localColumn: "column_two",
    },
    {
      airtableColumn: "Column three",
      localColumn: "column_three",
    },
  ],
};

export const validLocalQuery: ILocalQuery = {
  tableName: validSync.localTable,
  columns: ["column_one", "column_two", "column_three"],
};

export const validConfigBase: IConfig = {
  airtableApiKey: "apiTestValueKey",
  airtableBaseId: "appTestValueBase",
  airtableTableId: "tableId",
  syncs: [validSync],
};

export const validQueryResult: IQueryResult[] = [
  {
    column_one: 1,
    column_two: "bar",
    column_three: "baz",
    airtable_record_id: "rec1231",
  },
  {
    column_one: 2,
    column_two: "bar",
    column_three: "baz",
    airtable_record_id: "rec1232",
  },
  {
    column_one: 3,
    column_two: "bar",
    column_three: "baz",
    airtable_record_id: "rec1233",
  },
];

interface IRunInfoMock {
  changes: number;
  lastInsertRowId: string | number;
}

class SqliteStatmentMock {
  constructor() {
    // do nothing
  }
  public params: any[] = [];
  async all(params: any[]): Promise<IQueryResult[]> {
    await 0;
    this.params = params;
    return validQueryResult;
  }
  async run(params: any[]): Promise<IRunInfoMock> {
    await 0;
    return {
      changes: 3,
      lastInsertRowId: 123,
    };
  }
}

export class SqliteMock {
  public sql: string = "";
  public statementMock: SqliteStatmentMock;
  constructor(path: string, options?: any) {
    // do nothing
  }
  prepare(sql: string): SqliteStatmentMock {
    this.sql = sql;
    this.statementMock = new SqliteStatmentMock();
    return this.statementMock;
  }
}
