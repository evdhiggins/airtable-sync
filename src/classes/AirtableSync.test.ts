require("dotenv").config();
import ISchema from "src/interfaces/ISchema";
import { QueryResult } from "src/types";
import IDatabase from "src/interfaces/IDatabase";
import SyncRowFactory, { SyncRow } from "./SyncRow";
import AirtableSyncFactory, { AirtableSync } from "./AirtableSync";
import Airtable = require("Airtable");

const airtable: Airtable = new Airtable({ apiKey: process.env.API_KEY });
const table: Airtable.Table = airtable.base(process.env.BASE_ID)(
  process.env.TABLE_ID
);
const airtableSync: AirtableSync = AirtableSyncFactory();

const schemaMockFactory: (lookup: boolean) => ISchema = lookup => ({
  airtable: {
    apiKey: process.env.API_KEY,
    baseId: process.env.BASE_ID,
    tableId: process.env.TABLE_ID,
    lookupByPrimaryKey: lookup
  },
  local: {
    tableName: "T",
    syncFlag: {
      columnName: "c",
      true: "T",
      false: "F"
    },
    idColumns: {
      local: "id",
      airtable: "airtable_id"
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
});

const rowMockFactory: (lookup: boolean) => QueryResult = lookup => ({
  id: lookup ? "lookupvalue" : "1",
  airtable_id: null,
  c1: "c1"
});

const dbMock: IDatabase = ({} as unknown) as IDatabase;

const sleep: any = (ms: number): Promise<void> => {
  return new Promise(res => {
    setTimeout(() => res(), ms);
  });
};

const syncRowMockFactory: (lookup?: boolean) => SyncRow = (lookup = false) => {
  const row: QueryResult = rowMockFactory(lookup);
  const schema: ISchema = schemaMockFactory(lookup);
  return SyncRowFactory(row, schema, dbMock);
};

describe("update", () => {
  const recordIds: string[] = [];

  test("Add an row if not given a record ID", async () => {
    expect.assertions(3);

    // create instance of SyncRow
    const syncRow: SyncRow = syncRowMockFactory();

    // add the row to Airtable
    await airtableSync.update(syncRow);

    // manually fetch the new row from Airtable
    const recordId: string = syncRow.airtableId();
    const record: Airtable.Record = await table.find(recordId);

    recordIds.push(recordId);

    expect(record).not.toBe(null);
    expect(record.getId()).toBe(recordId);
    expect(record.fields.ID).toBe(syncRow.localRow().id);
  });

  test("Correctly acquire a row id via lookup value", async () => {
    expect.assertions(1);

    // manually create row
    const record: Airtable.Record = await table.create({ ID: "lookupvalue" });

    // create instance of SyncRow
    const syncRow: SyncRow = syncRowMockFactory(true);

    // add the row to Airtable
    await airtableSync.update(syncRow);
    recordIds.push(syncRow.airtableId());

    expect(syncRow.airtableId()).toBe(record.getId());
  });

  test("Add an row if given an invalid record ID", async () => {
    expect.assertions(2);

    // create instance of SyncRow
    const syncRow: SyncRow = syncRowMockFactory();
    const fakeId: string = "fake id";
    syncRow.setAirtableId(fakeId);

    // add the row to Airtable
    await airtableSync.update(syncRow);

    // extract the row ID
    const recordId: string = syncRow.airtableId();
    recordIds.push(recordId);

    expect(recordId).not.toBe(fakeId);
    expect(recordId).toMatch(/rec\w{14}/);
  });

  test("Add an row if given a deleted record ID", async () => {
    expect.assertions(2);

    // create and delete airtable row
    const record: Airtable.Record = await table.create({});
    const deletedId: string = record.getId();
    await table.destroy(deletedId);

    await sleep(500);

    // create instance of SyncRow
    const syncRow: SyncRow = syncRowMockFactory();
    syncRow.setAirtableId(deletedId);

    // add the row to Airtable
    await airtableSync.update(syncRow);

    // extract the row ID
    const recordId: string = syncRow.airtableId();
    recordIds.push(recordId);

    expect(recordId).not.toBe(deletedId);
    expect(recordId).toMatch(/rec\w{14}/);
  });

  test("Update a row in Airtable if given a valid record ID", async () => {
    expect.assertions(2);

    // manually create airtable row
    const newRecord: Airtable.Record = await table.create({
      ID: "updateTest",
      Col1: "updateTest"
    });
    const recordId: string = newRecord.getId();
    recordIds.push(recordId);

    // create instance of SyncRow and assign it newly created row id
    const syncRow: SyncRow = syncRowMockFactory();
    syncRow.setAirtableId(recordId);

    // update airtable row
    await airtableSync.update(syncRow);

    // load updated row from airtable
    const record: Airtable.Record = await table.find(recordId);

    // check updated row values
    expect(record.fields.ID).toBe(syncRow.localRow().id);
    expect(record.fields.Col1).toBe(syncRow.localRow().c1);
  });

  // avoid ever hitting the 5 calls / second airtable API limit
  afterEach(async done => {
    await sleep(1000);
    done();
  });

  // delete rows created when testing
  afterAll(async done => {
    await sleep(1000);
    for (let i of recordIds) {
      await table.destroy(i);
      await sleep(200);
    }
    done();
  });
});

describe("delete", () => {
  let deletedRow: Airtable.RecordData;
  let record: Airtable.Record;
  let syncRow: SyncRow;

  beforeAll(async done => {
    // wait for 1 second to avoid hitting airtable API call limits
    setTimeout(async () => {
      record = await table.create({ ID: "asdf", Col1: "fdsa" });
      syncRow = syncRowMockFactory();
      syncRow.setAirtableId(record.getId());
      deletedRow = await airtableSync.delete(syncRow);
      done();
    }, 1000);
  });
  test("Remove the deleted row from Airtable", done => {
    table.find(record.getId(), (err, rec) => {
      expect(err).toBeTruthy();
      expect(rec).toBeFalsy();
      done();
    });
  });

  test("Set the `SyncRow` airtable ID to `null`", () => {
    expect(syncRow.airtableId()).toBe(null);
  });

  test("Return an object containing all Airtable row values", () => {
    expect(deletedRow.ID).toBe("asdf");
    expect(deletedRow.Col1).toBe("fdsa");
  });

  test("Return an empty object if no airtable record exists with the id", async () => {
    expect.assertions(2);

    const syncRow: SyncRow = syncRowMockFactory();
    syncRow.setAirtableId("fake id");
    const record: Airtable.RecordData = await airtableSync.delete(syncRow);

    expect(typeof record).toBe("object");
    expect(Object.keys(record).length).toBe(0);
  });
});
