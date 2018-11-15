require("jest");
import converter from "./convertSyncToLocalQuery";
import { ILocalQuery } from "../../types";
import { validSync, validLocalQuery } from "../../tests/mocks";

describe("convertSyncToLocalQuery: It should...", () => {
  test("Return valid ILocalQuery object", () => {
    const result: ILocalQuery = converter(validSync);
    expect(result.tableName).toBeDefined();
    expect(result.columns).toBeDefined();
    expect(Array.isArray(result.columns)).toBe(true);
  });
  test("Properly convert columns", () => {
    const result: ILocalQuery = converter(validSync);
    expect(result.columns).toEqual(validLocalQuery.columns);
  });
});
