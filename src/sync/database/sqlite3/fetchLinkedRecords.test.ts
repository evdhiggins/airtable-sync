require("jest");
import getLinkedRecords from "./fetchLinkedRecords";
import { SyncClassMock } from "../../../tests/mocks";
import { IQueryResult, IColumn } from "src/types";
import * as Sqlite from "better-sqlite3";

const sqlite: Sqlite = new Sqlite("./db", { memory: true });

const baseColumnMock: IColumn = {
  localColumn: "order_ids",
  airtableColumn: "Orders",
  value: [1234, 1235, 1236],
  linkedColumn: true,
  multipleRecords: true,
  linkedTableName: "order_tb",
  linkedColumnName: "id",
  linkedRecordId: "record_id",
};

// create in-memory table for tests
sqlite.exec(
  // tslint:disable-next-line
  "CREATE TABLE order_tb (id INTEGER, record_id VARCHAR(17))",
);

describe("sqlite3 fetchLinkedRecords: It should... ", () => {
  let column: IColumn;
  beforeAll(async (done) => {
    column = await getLinkedRecords(sqlite, baseColumnMock);
    done();
  });

  test("Return an object", async () => {
    expect.assertions(2);
    expect(column).toBeDefined();
    expect(typeof column).toBe("object");
  });

  test("Not modify base IColumn fields", async () => {
    expect.assertions(3);
    const column: IColumn = await getLinkedRecords(sqlite, baseColumnMock);
    expect(column.localColumn).toEqual(baseColumnMock.localColumn);
    expect(column.airtableColumn).toEqual(baseColumnMock.airtableColumn);
    expect(column.value).toBeDefined();
  });

  test("`column.value` should be an array", async () => {
    expect.assertions(1);
    const column: IColumn = await getLinkedRecords(sqlite, baseColumnMock);
    expect(Array.isArray(column.value)).toBe(true);
  });

  describe("Returned `column.value` array should contain...", () => {
    beforeEach(() => {
      // sqlite doesn't have a TRUNCATE TABLE statement
      sqlite.exec("DELETE FROM order_tb");
    });

    test("No data when no matching rows exist", async () => {
      expect.assertions(1);
      sqlite.exec("INSERT INTO order_tb VALUES (1,'rec1');");
      sqlite.exec("INSERT INTO order_tb VALUES (2,'rec2');");
      sqlite.exec("INSERT INTO order_tb VALUES (3,'rec3');");
      const column: IColumn = await getLinkedRecords(sqlite, baseColumnMock);
      expect(column.value.length).toBe(0);
    });

    test("An array of matching values when they exist", async () => {
      expect.assertions(3);
      sqlite.exec("INSERT INTO order_tb VALUES (1234,'rec1');");
      sqlite.exec("INSERT INTO order_tb VALUES (2,'rec2');");
      sqlite.exec("INSERT INTO order_tb VALUES (1235,'rec3');");
      const column: IColumn = await getLinkedRecords(sqlite, baseColumnMock);
      expect(column.value.length).toBe(2);
      expect(column.value).toContain("rec1");
      expect(column.value).toContain("rec3");
    });
  });
});
