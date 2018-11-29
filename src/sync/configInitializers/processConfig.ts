import Sync from "./../../classes/Sync.class";
import { IConfigSync } from "src/types";
// tslint:disable-next-line
const isset = (v: any): boolean => typeof v !== "undefined" && v !== null;

export default (configBase: any): Sync[] => {
  if (!configBase || !(configBase.constructor === Object)) {
    throw new TypeError("Config base must be an object");
  }
  if (!Array.isArray(configBase.syncs) || configBase.syncs.length === 0) {
    throw new Error("Config base must contain at least one sync object");
  }

  // set root-level configurations
  const airtableApiKey: string =
    configBase.airtableApiKey || process.env.AIRTABLE_API_KEY;
  const airtableBaseId: string =
    configBase.airtableBaseId || process.env.AIRTABLE_BASE_ID;
  const airtableTableId: string =
    configBase.airtableTableId || process.env.AIRTABLE_TABLE_ID;
  const rootDatabaseClass: string =
    configBase.databaseClass || process.env.DATABASE_CLASS || "sqlite3";
  const rootDatabaseOptions: any = configBase.databaseOptions;
  const rootLocalIdColumns: any = configBase.localIdColumns;
  const rootSyncFlag: any = configBase.syncFlag;
  const rootAirtableLookup: boolean =
    isset(configBase.airtableLookupByPrimaryKey)
      ? configBase.airtableLookupByPrimaryKey
      : false;

  const syncs: Sync[] = [];

  configBase.syncs.forEach((sync: IConfigSync) => {
    // use sync-specific airtable config if defined, otherwise fall back on root config
    const apiKey: string = sync.airtableApiKey || airtableApiKey;
    const baseId: string = sync.airtableBaseId || airtableBaseId;
    const tableId: string = sync.airtableTableId || airtableTableId;
    const databaseClass: string = sync.databaseClass || rootDatabaseClass;
    const databaseOptions: any =
      sync.databaseOptions || rootDatabaseOptions || {};
    const localIdColumns: any = sync.localIdColumns || rootLocalIdColumns;
    const syncFlag: any = sync.syncFlag || rootSyncFlag;
    const airtableLookupByPrimaryKey: boolean =
      isset(sync.airtableLookupByPrimaryKey)
        ? sync.airtableLookupByPrimaryKey
        : rootAirtableLookup;

    if (!apiKey || !baseId || !tableId) {
      throw new Error(
        "Missing Airtable field. Airtable API Key, Base ID, and Table ID are all required.",
      );
    }

    if (
      !localIdColumns ||
      !syncFlag ||
      !localIdColumns.recordId ||
      !localIdColumns.primaryKey ||
      !syncFlag.columnName
    ) {
      throw new Error(
        // tslint:disable-next-line
        "Missing critical sync configuration field. Please verify that you have properly added `localIdColumns` and `syncFlag` to your config file.",
      );
    }

    // add sync
    syncs.push(
      new Sync({
        localTable: sync.localTable,
        columns: sync.columns,
        airtableApiKey: apiKey,
        airtableBaseId: baseId,
        airtableTableId: tableId,
        databaseClass,
        databaseOptions,
        localIdColumns,
        syncFlag,
        airtableLookupByPrimaryKey,
      }),
    );
  });

  return syncs;
};
