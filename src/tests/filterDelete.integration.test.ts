import ISchema from "../interfaces/ISchema";
import * as Sqlite from "better-sqlite3";
import Airtable = require("Airtable");
import { Config, SyncRunReport } from "../types";
import SyncMasterFactory, { SyncMaster } from "../classes/SyncMaster";
import { unlinkSync } from "fs";
import { resolve } from "path";

require("dotenv").config();

const dbFileName: string = "filterDelete.integration.test.db";
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

const mockDeleteCallback = jest.fn(row => row);

const schema: ISchema = {
  name: "filter delete test",
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
      type: "column",
      localColumn: "id",
      match: "2",
      actions: ["removeFromAirtable"],
      removeFromAirtableCallback: mockDeleteCallback
    }
  ]
};

const airtable: Airtable = new Airtable({ apiKey: process.env.API_KEY });
const table: Airtable.Table = airtable.base(process.env.BASE_ID)(
  process.env.TABLE_ID
);
const sqlite: Sqlite.Database = new Sqlite(dbFilePath);

describe("airtable-sync filter with delete match", () => {
  let syncRunReport: SyncRunReport;
  let recordId: string;
  beforeAll(async done => {
    // create test table
    sqlite.exec(
      "CREATE TABLE IF NOT EXISTS test (id VARCHAR(10), c1 VARCHAR(15), sync_flag VARCHAR(1), record_id VARCHAR(15))"
    );

    // add test record to airtable directly
    const record: Airtable.Record = await table.create(
      { ID: "2", Col1: "row to delete" },
      { typecast: true }
    );
    recordId = record.getId();

    // load test table with test data
    sqlite.exec("DELETE FROM test");
    sqlite.exec(
      `INSERT INTO test VALUES ('2','different value', 'T', '${recordId}');`
    );

    // run airtable sync
    const syncMaster: SyncMaster = SyncMasterFactory(options);
    syncMaster.addSync(schema);
    const report: SyncRunReport[] = await syncMaster.run();
    syncRunReport = report[0] || ({} as SyncRunReport);
    done();
  }, 60000);

  test("`syncRunReport` contains sync name", () => {
    expect(syncRunReport.name).toBe("filter delete test");
  });

  test("`syncRunReport` includes deleted rows in sync row count", () => {
    expect(syncRunReport.rows).toBe(1);
  });

  test("Deleted rows have their sync flag set to `false`", () => {
    const row: any = sqlite.prepare("SELECT * FROM test WHERE id = '2'").get();
    expect(row[schema.local.syncFlag.columnName]).toBe(
      schema.local.syncFlag.false
    );
  });

  test("Deleted rows have their local airtable ID value set to `null`", () => {
    const row: any = sqlite.prepare("SELECT * FROM test WHERE id = '2'").get();
    expect(row.record_id).toBe(null);
  });

  test("Deleted row is removed from Airtable", done => {
    table.find(recordId, (err, record) => {
      expect(err).toBeTruthy();
      expect(record).toBeFalsy();
      done();
    });
  });

  test("Deleted row callback has been been called", () => {
    expect(mockDeleteCallback.mock.calls.length).toBe(1);
  });

  test("Deleted row callback has been called with airtable data", () => {
    const arg = mockDeleteCallback.mock.calls[0][0];
    expect(arg.ID).toBe("2");
    expect(arg.Col1).toBe("row to delete");
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
