require("jest");
import getRowsToSync from "./fetchRowsToSync";
import { SyncClassMock } from "../../../tests/mocks";
import SqliteMock from "./__mocks__/sqlite3";
import { IQueryResult } from "src/types";

/**
 * Currently this test just examines the SQL generated.
 * TODO: Test with an in-memory SQlite db
 */

describe("sqlite3 getRowsToSync: It should... ", () => {
  test("Return an array", async () => {
    expect.assertions(1);
    const result: IQueryResult[] = await getRowsToSync(
      new SqliteMock("path/to/db.sql"),
      SyncClassMock
    );
    expect(Array.isArray(result)).toBe(true);
  });

  test("Generate a SQL string with a number of '?'s that match the number of params", async () => {
    expect.assertions(1);
    const mockDb: SqliteMock = new SqliteMock("path/to/db.sql");
    await getRowsToSync(mockDb, SyncClassMock);
    const numberOfParams: number = mockDb.sql.split("?").length - 1;
    expect(numberOfParams).toBe(mockDb.statementMock.params.length);
  });
});
