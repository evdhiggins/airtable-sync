import { ISync } from "src/types";

export default (configBase: any): ISync[] => {
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

  const syncs: ISync[] = [];

  configBase.syncs.forEach((sync: ISync) => {
    // use sync-specific airtable config if defined, otherwise fall back on root config
    const apiKey: string = sync.airtableApiKey || airtableApiKey;
    const baseId: string = sync.airtableBaseId || airtableBaseId;
    const tableId: string = sync.airtableTableId || airtableTableId;
    const databaseClass: string = sync.databaseClass || rootDatabaseClass;

    if (!apiKey || !baseId || !tableId) {
      throw new Error(
        "Missing Airtable field. Airtable API Key, Base ID, and Table ID are all required.",
      );
    }

    // add sync
    syncs.push({
      localTable: sync.localTable,
      columns: sync.columns,
      airtableApiKey: apiKey,
      airtableBaseId: baseId,
      airtableTableId: tableId,
      databaseClass,
    });
  });

  return syncs;
};
