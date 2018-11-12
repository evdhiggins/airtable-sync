import { ISync, IConfig, ILocalQuery } from "./../types";

export const validSync: ISync = {
  localTable: "table_name",
  columns: [
    {
      airtableColumn: "Column one",
      localColumn: "column_one",
    },
    {
      airtableColumn: "Column two",
      localColumn: "column_two",
    },
    {
      airtableColumn: "Column three",
      localColumn: "column_three",
    },
  ],
};

export const validLocalQuery: ILocalQuery = {
  tableName: validSync.localTable,
  columns: ["column_one", "column_two", "column_three"],
};

export const validConfigBase: IConfig = {
  airtableApiKey: "apiTestValueKey",
  airtableBaseId: "appTestValueBase",
  airtableTableId: "tableId",
  syncs: [validSync],
};
