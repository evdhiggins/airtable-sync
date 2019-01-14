import { Config, Schema, IColumn } from "src/types";
import SyncClass from "../classes/Sync.class";

export default (schema: Schema, config: Config): SyncClass => {
  const apiKey: string = schema.airtable.apiKey || config.airtable.apiKey;
  const baseId: string = schema.airtable.baseId || config.airtable.baseId;
  const tableId: string = schema.airtable.tableId || config.airtable.tableId;
  const databaseClass: string = "" || config.database.name;
  const databaseOptions: any = null || config.database.options || {};
  const localIdColumns: any = {
    recordId: schema.database.idColumns.airtable,
    primaryKey: schema.database.idColumns.database
  };
  const syncFlag: any = schema.database.syncFlag;
  const airtableLookupByPrimaryKey: boolean =
    schema.airtable.lookupByPrimaryKey === true;

  if (!apiKey || !baseId || !tableId) {
    throw new Error(
      "Missing Airtable field. Airtable API Key, Base ID, and Table ID are all required."
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
      "Missing critical sync configuration field. Please verify that you have properly added `localIdColumns` and `syncFlag` to your config file."
    );
  }

  return new SyncClass({
    localTable: schema.database.tableName,
    columns: (schema.columns as unknown) as IColumn[],
    airtableApiKey: apiKey,
    airtableBaseId: baseId,
    airtableTableId: tableId,
    databaseClass,
    databaseOptions,
    localIdColumns,
    syncFlag,
    airtableLookupByPrimaryKey
  });
};
