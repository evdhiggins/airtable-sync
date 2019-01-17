require("jest");
import getRowsToSync from "./fetchRowsToSync";
import { localSchemaMock, columnsMock } from "../../../tests/mocks";
import { QueryResult } from "../../../types";
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
    const result: QueryResult[] = await getRowsToSync(
      sqlite,
      localSchemaMock,
      columnsMock,
    );
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
      const result: QueryResult[] = await getRowsToSync(
        sqlite,
        localSchemaMock,
        columnsMock,
      );
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
      const result: QueryResult[] = await getRowsToSync(
        sqlite,
        localSchemaMock,
        columnsMock,
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    test("All columns specified in schema", async () => {
      expect.assertions(columnsMock.length);
      sqlite.exec(
        "INSERT INTO test_tb VALUES (1,'foo1', 'bar1', 'foobar1', 'T', NULL);",
      );

      const result: QueryResult[] = await getRowsToSync(
        sqlite,
        localSchemaMock,
        columnsMock,
      );
      columnsMock.forEach((column) => {
        expect(result[0][column.localColumn]).toBeDefined();
      });
    });

    test("Local ID column", async () => {
      expect.assertions(1);
      sqlite.exec(
        "INSERT INTO test_tb VALUES (1,'foo1', 'bar1', 'foobar1', 'T', NULL);",
      );

      const result: QueryResult[] = await getRowsToSync(
        sqlite,
        localSchemaMock,
        columnsMock,
      );
      expect(result[0][localSchemaMock.idColumns.local]).toBeDefined();
    });
    test("Airtable ID column", async () => {
      expect.assertions(1);
      sqlite.exec(
        "INSERT INTO test_tb VALUES (1,'foo1', 'bar1', 'foobar1', 'T', NULL);",
      );

      const result: QueryResult[] = await getRowsToSync(
        sqlite,
        localSchemaMock,
        columnsMock,
      );
      expect(result[0][localSchemaMock.idColumns.airtable]).toBeDefined();
    });
  });
});
