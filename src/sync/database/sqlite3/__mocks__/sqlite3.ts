import { IQueryResultMock } from "../../../../tests/mocks";
import { IQueryResult } from "src/types";

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
    return IQueryResultMock;
  }
  async run(params: any[]): Promise<IRunInfoMock> {
    await 0;
    return {
      changes: 3,
      lastInsertRowId: 123
    };
  }
}

export default class {
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
