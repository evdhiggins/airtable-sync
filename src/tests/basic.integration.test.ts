import ISchema from "../interfaces/ISchema";
import * as Sqlite from "better-sqlite3";
import * as Airtable from 'airtable';
import { Config, SyncRunReport } from "../types";
import SyncMasterFactory, { SyncMaster } from "../classes/SyncMaster";
import { unlinkSync } from "fs";
import { resolve } from "path";

require("dotenv").config();

const dbFileName: string = "basic.integration.test.db";
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

const schema: ISchema = {
  name: "basic test",
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
  ]
};

const airtable: Airtable = new Airtable({ apiKey: process.env.API_KEY });
const table: Airtable.Table = airtable.base(process.env.BASE_ID)(
  process.env.TABLE_ID
);

const sqlite: Sqlite.Database = new Sqlite(dbFilePath);

describe("airtable-sync basic integration", () => {
  let syncRunReport: SyncRunReport;
  let recordId: string;
  beforeAll(async done => {
    // create in-test table
    sqlite.exec(
      "CREATE TABLE IF NOT EXISTS test (id VARCHAR(10), c1 VARCHAR(15), sync_flag VARCHAR(1), record_id VARCHAR(15))"
    );

    // manually load test row into airtable
    const record: Airtable.Record = await table.create(
      { ID: "2", Col1: "before sync" },
      { typecast: true }
    );
    recordId = record.getId();

    // load test table with test data
    sqlite.exec("DELETE FROM test");
    sqlite.exec("INSERT INTO test VALUES ('1','foo1', 'T', NULL);");
    sqlite.exec(
      `INSERT INTO test VALUES ('2','after sync', 'T', '${recordId}');`
    );
    sqlite.exec(`INSERT INTO test VALUES ('3','Not synced', 'F', NULL)`);

    // run airtableSync
    const syncMaster: SyncMaster = SyncMasterFactory(options);
    syncMaster.addSync(schema);
    const report: SyncRunReport[] = await syncMaster.run();
    syncRunReport = report[0] || ({} as SyncRunReport);
    done();
  }, 60000);

  test("`syncRunReport` contains sync name", () => {
    expect(syncRunReport.name).toBe("basic test");
  });

  test("`syncRunReport` contains correct number of synced rows", () => {
    expect(syncRunReport.rows).toBe(2);
  });

  test("All rows should have their sync flags set to false", () => {
    const rows: any[] = sqlite
      .prepare("SELECT * FROM test where sync_flag = 'T'")
      .all();
    expect(rows.length).toBe(0);
  });

  test("Existing rows in Airtable should be updated", async () => {
    expect.assertions(2);
    const record: Airtable.Record = await table.find(recordId);
    expect(record.fields.ID).toBe("2");
    expect(record.fields.Col1).toBe("after sync");
  });

  test("Rows synced without an airtable id should be assigned one", () => {
    const row: any = sqlite.prepare("SELECT * FROM test WHERE id='1'").get();
    expect(row.record_id).toMatch(/rec\w{14}/);
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
