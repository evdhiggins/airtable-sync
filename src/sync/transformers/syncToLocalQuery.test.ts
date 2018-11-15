require("jest");
import converter from "./syncToLocalQuery";
import { ILocalQuery } from "../../types";
import { ISyncMock, ILocalQueryMock } from "../../tests/mocks";

describe("convertSyncToLocalQuery: It should...", () => {
  test("Return valid ILocalQuery object", () => {
    const result: ILocalQuery = converter(ISyncMock);
    expect(result.tableName).toBeDefined();
    expect(result.columns).toBeDefined();
    expect(Array.isArray(result.columns)).toBe(true);
  });
  test("Properly convert columns", () => {
    const result: ILocalQuery = converter(ISyncMock);
    expect(result.columns).toEqual(ILocalQueryMock.columns);
  });
});
