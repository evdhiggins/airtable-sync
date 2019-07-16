require("jest");
import getLinkedRecords from "./fetchLinkedRecords";
import * as Sqlite from "better-sqlite3";
import { LinkedColumnDetails } from "../../interfaces/ISyncColumn";

const sqlite: Sqlite.Database = new Sqlite("./fetchLinkedRecords.test.db", {
  memory: true,
});

const linkDetailsMock: LinkedColumnDetails = {
  tableName: "orders",
  lookupColumn: "id",
  returnColumn: "record_id",
  multipleRecords: true,
};

const valueMock: any = [1234, 1235, 1236];

// create in-memory table for tests
sqlite.exec(
  // tslint:disable-next-line
  "CREATE TABLE orders (id INTEGER, record_id VARCHAR(17))",
);

describe("sqlite3 fetchLinkedRecords: It should... ", () => {
  test("Return an array", async () => {
    expect.assertions(2);
    const linkedValues: any[] = await getLinkedRecords(
      sqlite,
      linkDetailsMock,
      valueMock,
    );
    expect(linkedValues).toBeDefined();
    expect(Array.isArray(linkedValues)).toBe(true);
  });

  describe("Returned `linkedValues` array should contain...", () => {
    beforeEach(() => {
      // sqlite doesn't have a TRUNCATE TABLE statement
      sqlite.exec("DELETE FROM orders");
    });

    test("No data when no matching rows exist", async () => {
      expect.assertions(1);
      sqlite.exec("INSERT INTO orders VALUES (1,'rec1');");
      sqlite.exec("INSERT INTO orders VALUES (2,'rec2');");
      sqlite.exec("INSERT INTO orders VALUES (3,'rec3');");
      const linkedValues: any[] = await getLinkedRecords(
        sqlite,
        linkDetailsMock,
        valueMock,
      );
      expect(linkedValues.length).toBe(0);
    });

    test("An array of matching values when they exist", async () => {
      expect.assertions(3);
      sqlite.exec("INSERT INTO orders VALUES (1234,'rec1');");
      sqlite.exec("INSERT INTO orders VALUES (2,'rec2');");
      sqlite.exec("INSERT INTO orders VALUES (1235,'rec3');");
      const linkedValues: any[] = await getLinkedRecords(
        sqlite,
        linkDetailsMock,
        valueMock,
      );
      expect(linkedValues.length).toBe(2);
      expect(linkedValues).toContain("rec1");
      expect(linkedValues).toContain("rec3");
    });
  });
});
