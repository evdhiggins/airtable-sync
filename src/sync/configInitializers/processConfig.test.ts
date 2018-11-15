require("jest");
import configLoader from "./processConfig";
import { ISync } from "../../types";
import { IConfigMock, IConfigSyncMock } from "../../tests/mocks";
import { ITestFn } from "../../tests/types";

describe("processConfig: it should...", () => {
  describe("Throw an error if...", () => {
    test("Input isn't an object", () => {
      const withArray: ITestFn = () => configLoader([]);
      const withString: ITestFn = () => configLoader("");
      const withUndefined: ITestFn = () => configLoader(undefined);
      const withObject: ITestFn = () => configLoader(IConfigMock);

      expect(withArray).toThrow();
      expect(withString).toThrow();
      expect(withUndefined).toThrow();
      expect(withObject).not.toThrow();
    });

    test("Input object doesn't contain array of syncs", () => {
      const noSync: ITestFn = () => configLoader({});
      const emptySync: ITestFn = () => configLoader({ syncs: [] });

      expect(noSync).toThrow();
      expect(emptySync).toThrow();
    });

    test("Input is missing any airtable config field", () => {
      const missingApiKey: ITestFn = () =>
        configLoader({
          airtableBaseId: "base",
          airtableTableId: "table",
          syncs: [IConfigSyncMock],
        });

      const missingBaseId: ITestFn = () =>
        configLoader({
          airtableApiKey: "key",
          airtableTableId: "table",
          syncs: [IConfigSyncMock],
        });

      const missingTableId: ITestFn = () =>
        configLoader({
          airtableApiKey: "key",
          airtableBaseId: "base",
          syncs: [IConfigSyncMock],
        });

      const validConfig: ITestFn = () =>
        configLoader({
          airtableApiKey: "key",
          airtableBaseId: "base",
          airtableTableId: "table",
          syncs: [IConfigSyncMock],
        });

      expect(missingApiKey).toThrow();
      expect(missingBaseId).toThrow();
      expect(missingTableId).toThrow();
      expect(validConfig).not.toThrow();
    });
  });

  describe("Return a value that ...", () => {
    test("Is an array", () => {
      const result: ISync[] = configLoader(IConfigMock);
      expect(Array.isArray(result)).toBe(true);
    });

    test("Contains least one sync object", () => {
      const result: ISync[] = configLoader(IConfigMock);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("localTable");
      expect(result[0]).toHaveProperty("columns");
    });

    test("Contains sync objects that are properly structured", () => {
      const results: ISync[] = configLoader(IConfigMock);
      results.forEach((sync) => {
        expect(sync.localTable).toBeDefined();
        expect(sync.airtableApiKey).toBeDefined();
        expect(sync.airtableBaseId).toBeDefined();
        expect(sync.airtableTableId).toBeDefined();
        expect(sync.databaseClass).toBeDefined();
        expect(sync.columns).toBeDefined();
      });
    });
    test("Contains sync objects that properly inherit airtable configurations", () => {
      const envConfigKey: string = "env_key";
      const rootConfigKey: string = "root_key";
      const localConfigKey: string = "local_key";
      process.env.AIRTABLE_API_KEY = envConfigKey;

      const envResult: ISync[] = configLoader({
        airtableBaseId: "appTestValueBase",
        syncs: [
          {
            localTable: "table_name",
            airtableTableId: "tblabewhrkejwh",
            columns: [],
          },
        ],
      });

      const rootResult: ISync[] = configLoader({
        airtableApiKey: rootConfigKey,
        airtableBaseId: "appTestValueBase",
        syncs: [
          {
            localTable: "table_name",
            airtableTableId: "tblabewhrkejwh",
            columns: [],
          },
        ],
      });

      const localResult: ISync[] = configLoader({
        airtableBaseId: "appTestValueBase",
        airtableApiKey: rootConfigKey,
        syncs: [
          {
            airtableApiKey: localConfigKey,
            localTable: "table_name",
            airtableTableId: "tblabewhrkejwh",
            columns: [],
          },
        ],
      });

      expect(envResult[0].airtableApiKey).toEqual(envConfigKey);
      expect(rootResult[0].airtableApiKey).toEqual(rootConfigKey);
      expect(localResult[0].airtableApiKey).toEqual(localConfigKey);
    });
  });
});
