require("jest");
import updateSyncedRows from "./updateSyncedRows";
import { rowMock, localSchemaMock } from "../../tests/mocks";
import * as Sqlite from "better-sqlite3";

const sqlite: Sqlite = new Sqlite("./updateSyncedRows.test.db", {
  memory: true,
});

// create in-memory table for tests
sqlite.exec(
  // tslint:disable-next-line
  "CREATE TABLE test_tb (id INTEGER, column_one VARCHAR(15), column_two VARCHAR(15), column_three VARCHAR(15), sync_flag VARCHAR(1), record_id VARCHAR(15))",
);

type QueryResult = {
  [index: string]: any;
};

describe("sqlite3 getRowsToSync: It should... ", () => {
  describe("Update the correct fields...", () => {
    beforeEach(() => {
      sqlite.exec("DELETE FROM test_tb");
      sqlite.exec(
        "INSERT INTO test_tb VALUES (1,'foo1', 'bar1', 'foobar1', 'T', NULL);",
      );
    });

    test("Sync flag", async () => {
      expect.assertions(1);
      await updateSyncedRows(sqlite, localSchemaMock, rowMock);
      const row: QueryResult = sqlite
        .prepare("SELECT * FROM test_tb WHERE id=1")
        .get();
      expect(row[localSchemaMock.syncFlag.columnName]).toBe(
        localSchemaMock.syncFlag.false,
      );
    });
    test("Airtable ID", async () => {
      expect.assertions(1);
      await updateSyncedRows(sqlite, localSchemaMock, rowMock);
      const row: QueryResult = sqlite
        .prepare("SELECT * FROM test_tb WHERE id=1")
        .get();
      expect(row[localSchemaMock.idColumns.airtable]).toBe(
        rowMock[localSchemaMock.idColumns.airtable],
      );
    });
  });

  describe("Not update unrelated fields", () => {
    beforeEach(() => {
      sqlite.exec("DELETE FROM test_tb");
      sqlite.exec(
        "INSERT INTO test_tb VALUES (1,'foo1', 'bar1', 'foobar1', 'T', NULL);",
      );
      sqlite.exec(
        "INSERT INTO test_tb VALUES (2,'foo2', 'bar2', 'foobar2', 'T', NULL);",
      );
      sqlite.exec(
        "INSERT INTO test_tb VALUES (3,'foo3', 'bar3', 'foobar3', 'T', NULL);",
      );
    });

    test("Non-sync data fields", async () => {
      expect.assertions(3);
      await updateSyncedRows(sqlite, localSchemaMock, rowMock);
      const row: QueryResult = sqlite
        .prepare("SELECT * FROM test_tb WHERE id=1")
        .get();
      expect(row.column_one).toBe("foo1");
      expect(row.column_two).toBe("bar1");
      expect(row.column_three).toBe("foobar1");
    });

    test("Other rows", async () => {
      expect.assertions(4);
      await updateSyncedRows(sqlite, localSchemaMock, rowMock);
      const row2: QueryResult = sqlite
        .prepare("SELECT * FROM test_tb WHERE id=2")
        .get();
      const row3: QueryResult = sqlite
        .prepare("SELECT * FROM test_tb WHERE id=3")
        .get();

      expect(row2[localSchemaMock.idColumns.airtable]).toBe(null);
      expect(row2[localSchemaMock.syncFlag.columnName]).toBe("T");
      expect(row3[localSchemaMock.idColumns.airtable]).toBe(null);
      expect(row3[localSchemaMock.syncFlag.columnName]).toBe("T");
    });
  });
});
