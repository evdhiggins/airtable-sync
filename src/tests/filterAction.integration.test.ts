import ISchema from "../interfaces/ISchema";
import * as Sqlite from "better-sqlite3";
import Airtable = require("Airtable");
import { Config, SyncRunReport } from "../types";
import SyncMasterFactory, { SyncMaster } from "../classes/SyncMaster";
import { unlinkSync } from "fs";
import { resolve } from "path";

require("dotenv").config();

const dbFileName: string = "filterAction.integration.test.db";
const dbFilePath: string = resolve(__dirname, dbFileName);

const options: Config = {
  airtable: {},
  database: {
    name: "sqlite3",
    options: {
      path: dbFilePath
    }
  }
};

const mockActionOne = jest.fn(row => row);
const mockActionTwo = jest.fn(row => row);

const schema: ISchema = {
  name: "filter action test",
  airtable: {
    apiKey: process.env.API_KEY,
    baseId: process.env.BASE_ID,
    tableId: process.env.TABLE_ID
  },
  local: {
    tableName: "test",
    syncFlag: {
      columnName: "sync_flag",
      true: "T",
      false: "F"
    },
    idColumns: {
      local: "id",
      airtable: "record_id"
    }
  },
  columns: [
    {
      localColumn: "id",
      airtableColumn: "ID"
    },
    {
      localColumn: "c1",
      airtableColumn: "Col1"
    }
  ],
  filters: [
    {
      type: "row",
      match: row => Number(row.id) % 2 === 0,
      actions: [mockActionOne, mockActionTwo]
    },
    {
      type: "row",
      match: () => true,
      actions: ["skipSync"]
    }
  ]
};

const sqlite: Sqlite = new Sqlite(dbFilePath);

describe("airtable-sync action filter integration", () => {
  let syncRunReport: SyncRunReport;
  beforeAll(async done => {
    // create test table
    sqlite.exec(
      "CREATE TABLE IF NOT EXISTS test (id VARCHAR(10), c1 VARCHAR(15), sync_flag VARCHAR(1), record_id VARCHAR(15))"
    );

    // load test table with test data
    sqlite.exec("DELETE FROM test");
    sqlite.exec(`INSERT INTO test VALUES ('1','row1', 'T', NULL);`);
    sqlite.exec(`INSERT INTO test VALUES ('2','row2', 'T', NULL);`);
    sqlite.exec(`INSERT INTO test VALUES ('3','row3', 'T', NULL);`);
    sqlite.exec(`INSERT INTO test VALUES ('4','row4', 'T', NULL);`);

    // run airtable sync
    const syncMaster: SyncMaster = SyncMasterFactory(options);
    syncMaster.addSync(schema);
    const report: SyncRunReport[] = await syncMaster.run();
    syncRunReport = report[0] || ({} as SyncRunReport);
    done();
  }, 60000);

  test("All rows, even with `skipSync`, have their sync flag set to `false`", () => {
    const rows: any[] = sqlite
      .prepare("SELECT * FROM test WHERE sync_flag = 'T'")
      .all();
    expect(rows.length).toBe(0);
  });

  test("All rows, due to 'skipSync', have their local airtable ID value set to `null`", () => {
    const rows: any[] = sqlite
      .prepare("SELECT * FROM test WHERE record_id IS NULL")
      .all();
    expect(rows.length).toBe(4);
  });

  test("Action functions have been called for all row matches", () => {
    expect(mockActionOne.mock.calls.length).toBe(2);
    expect(mockActionTwo.mock.calls.length).toBe(2);
  });

  test("Action functions were called with correct row data", () => {
    const rowTwoArg = mockActionOne.mock.calls[0][0];
    const rowFourArg = mockActionTwo.mock.calls[1][0];
    expect(rowTwoArg.id).toBe("2");
    expect(rowTwoArg.c1).toBe("row2");
    expect(rowFourArg.id).toBe("4");
    expect(rowFourArg.c1).toBe("row4");
  });

  afterAll(done => {
    try {
      sqlite.close();
      unlinkSync(dbFilePath);
    } catch (_) {
      // error deleting test db
    }
    done();
  });
});
