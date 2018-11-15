require("jest");
import getRowsToSync from "./fetchRowsToSync";
import { validLocalQuery, SqliteMock } from "../../../tests/mocks";
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
      validLocalQuery,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  test("Generate a SQL string with a number of '?'s that match the number of params", async () => {
    expect.assertions(1);
    const mockDb: SqliteMock = new SqliteMock("path/to/db.sql");
    await getRowsToSync(mockDb, validLocalQuery);
    const numberOfParams: number = mockDb.sql.split("?").length - 1;
    expect(numberOfParams).toBe(mockDb.statementMock.params.length);
  });

  test("Generate the correct number of params", async () => {
    expect.assertions(1);
    const mockDb: SqliteMock = new SqliteMock("path/to/db.sql");
    await getRowsToSync(mockDb, validLocalQuery);
    const expectedNumber: number = validLocalQuery.columns.length + 1;
    expect(mockDb.statementMock.params.length).toBe(expectedNumber);
  });
});
