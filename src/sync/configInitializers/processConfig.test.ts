require("jest");
import configLoader from "./processConfig";
import {
  IConfigMock,
  IFullConfigSyncMock,
  IPartialConfigSyncMock
} from "../../tests/mocks";
import { ITestFn } from "../../tests/types";
import Sync from "../../classes/Sync.class";
import { IConfig } from "src/types";

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
          syncs: [IPartialConfigSyncMock]
        });

      const missingBaseId: ITestFn = () =>
        configLoader({
          airtableApiKey: "key",
          airtableTableId: "table",
          syncs: [IPartialConfigSyncMock]
        });

      const missingTableId: ITestFn = () =>
        configLoader({
          airtableApiKey: "key",
          airtableBaseId: "base",
          syncs: [IPartialConfigSyncMock]
        });

      const validConfig: ITestFn = () =>
        configLoader({
          airtableApiKey: "key",
          airtableBaseId: "base",
          airtableTableId: "table",
          syncs: [IPartialConfigSyncMock]
        });

      expect(missingApiKey).toThrow();
      expect(missingBaseId).toThrow();
      expect(missingTableId).toThrow();
      expect(validConfig).not.toThrow();
    });
  });

  describe("Return a value that ...", () => {
    test("Is an array", () => {
      const result: Sync[] = configLoader(IConfigMock);
      expect(Array.isArray(result)).toBe(true);
    });

    test("Contains least one sync object", () => {
      const result: Sync[] = configLoader(IConfigMock);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("localTable");
      expect(result[0]).toHaveProperty("columns");
    });

    describe("Returned Sync classes are properly structured:", () => {
      const sync: Sync = configLoader(IConfigMock)[0];

      test("localTable exists", () => {
        expect(sync.localTable).toBeDefined();
      });

      test("Airtable fields are set", () => {
        expect(typeof sync.airtableApiKey).toBe("string");
        expect(typeof sync.airtableBaseId).toBe("string");
        expect(typeof sync.airtableTableId).toBe("string");
      });

      test("Database fields are set", () => {
        expect(typeof sync.databaseClass).toBe("string");
        expect(sync.databaseOptions).toBeDefined();
      });

      test("localIdColumn fields are set", () => {
        expect(sync.localIdColumns).toBeDefined();
        expect(typeof sync.localIdColumns.primaryKey).toBe("string");
        expect(typeof sync.localIdColumns.recordId).toBe("string");
      });

      test("syncFlag fields are set", () => {
        expect(sync.syncFlag).toBeDefined();
        expect(typeof sync.syncFlag.columnName).toBe("string");
        expect(typeof sync.syncFlag.true).toBe("boolean");
      });

      test("Sync columns are set", () => {
        expect(Array.isArray(sync.columns)).toBe(true);
      });
    });
    test("Contains sync objects that properly inherit Airtable configurations", () => {
      const envConfigKey: string = "env_key";
      const rootConfigKey: string = "root_key";
      const localConfigKey: string = "local_key";
      process.env.AIRTABLE_API_KEY = envConfigKey;

      const SyncBaseMock: any = {
        airtableBaseId: "appTestValueBase",
        databaseClass: "sqlite3",
        databaseOptions: {},
        localIdColumns: {
          recordId: "record",
          primaryKey: "id"
        },
        syncFlag: {
          columnName: "sync",
          true: true,
          false: 0
        },
        syncs: [
          {
            localTable: "table_name",
            airtableTableId: "tblabewhrkejwh",
            columns: []
          }
        ]
      };

      const envResult: Sync[] = configLoader(SyncBaseMock);

      const rootResult: Sync[] = configLoader(
        Object.assign({ airtableApiKey: rootConfigKey }, SyncBaseMock)
      );
      const localResult: Sync[] = configLoader(
        Object.assign({}, SyncBaseMock, {
          airtableApiKey: rootConfigKey,
          syncs: [
            {
              airtableApiKey: localConfigKey,
              localTable: "table_name",
              airtableTableId: "tblabewhrkejwh",
              columns: []
            }
          ]
        })
      );

      expect(envResult[0].airtableApiKey).toEqual(envConfigKey);
      expect(rootResult[0].airtableApiKey).toEqual(rootConfigKey);
      expect(localResult[0].airtableApiKey).toEqual(localConfigKey);
    });
  });
});
