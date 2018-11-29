require("jest");
import getRowsToSync from "./fetchRowsToSync";
import { SyncClassMock } from "../../../tests/mocks";
import { IQueryResult } from "src/types";
import * as Sqlite from "better-sqlite3";

const sqlite: Sqlite = new Sqlite("./db", { memory: true });

// create in-memory table for tests
sqlite.exec(
  // tslint:disable-next-line
  "CREATE TABLE test_tb (id INTEGER, column_one VARCHAR(15), column_two VARCHAR(15), column_three VARCHAR(15), sync_flag VARCHAR(1), record_id VARCHAR(15))",
);

describe("sqlite3 getRowsToSync: It should... ", () => {
  test("Return an empty array when no rows exist", async () => {
    expect.assertions(2);
    const result: IQueryResult[] = await getRowsToSync(sqlite, SyncClassMock);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  describe("Returned array should contain...", () => {
    beforeEach(() => {
      // sqlite doesn't have a TRUNCATE TABLE statement
      sqlite.exec("DELETE FROM test_tb");
    });

    test("No data when no sync flags are set", async () => {
      expect.assertions(2);
      sqlite.exec(
        "INSERT INTO test_tb VALUES (1,'foo1', 'bar1', 'foobar1', 'F', NULL);",
      );
      sqlite.exec(
        "INSERT INTO test_tb VALUES (2,'foo2', 'bar2', 'foobar2', 'F', NULL);",
      );
      sqlite.exec(
        "INSERT INTO test_tb VALUES (2,'foo2', 'bar2', 'foobar2', 'F', NULL);",
      );
      const result: IQueryResult[] = await getRowsToSync(sqlite, SyncClassMock);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test("The same number of results as sync flags set", async () => {
      expect.assertions(2);
      sqlite.exec(
        "INSERT INTO test_tb VALUES (1,'foo1', 'bar1', 'foobar1', 'T', NULL);",
      );
      sqlite.exec(
        "INSERT INTO test_tb VALUES (2,'foo2', 'bar2', 'foobar2', 'F', NULL);",
      );
      sqlite.exec(
        "INSERT INTO test_tb VALUES (2,'foo2', 'bar2', 'foobar2', 'T', NULL);",
      );
      const result: IQueryResult[] = await getRowsToSync(sqlite, SyncClassMock);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    test("All columns specified in config", async () => {
      expect.assertions(SyncClassMock.columns.length);
      sqlite.exec(
        "INSERT INTO test_tb VALUES (1,'foo1', 'bar1', 'foobar1', 'T', NULL);",
      );

      const result: IQueryResult[] = await getRowsToSync(sqlite, SyncClassMock);
      SyncClassMock.columns.forEach((column) => {
        expect(result[0][column.localColumn]).toBeDefined();
      });
    });

    test("ID column", async () => {
      expect.assertions(1);
      sqlite.exec(
        "INSERT INTO test_tb VALUES (1,'foo1', 'bar1', 'foobar1', 'T', NULL);",
      );

      const result: IQueryResult[] = await getRowsToSync(sqlite, SyncClassMock);
      expect(result[0][SyncClassMock.localIdColumns.primaryKey]).toBeDefined();
    });
    test("Airtable ID column", async () => {
      expect.assertions(1);
      sqlite.exec(
        "INSERT INTO test_tb VALUES (1,'foo1', 'bar1', 'foobar1', 'T', NULL);",
      );

      const result: IQueryResult[] = await getRowsToSync(sqlite, SyncClassMock);
      expect(result[0][SyncClassMock.localIdColumns.recordId]).toBeDefined();
    });
  });
});
