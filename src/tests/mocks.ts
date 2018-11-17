import { IConfig, IQueryResult, IConfigSync } from "../types";
import Sync from "../classes/Sync.class";
import SyncRow from "../classes/SyncRow.class";

export const IFullConfigSyncMock: IConfigSync = {
  localTable: "table_name",
  airtableApiKey: "key",
  airtableBaseId: "base",
  airtableTableId: "table",
  databaseClass: "sqlite3",
  databaseOptions: {},
  localIdColumns: {
    recordId: "record_id",
    primaryKey: "id"
  },
  syncFlag: {
    columnName: "flag",
    true: true,
    false: false
  },
  columns: [
    {
      airtableColumn: "Column one",
      localColumn: "column_one"
    },
    {
      airtableColumn: "Column two",
      localColumn: "column_two"
    },
    {
      airtableColumn: "Column three",
      localColumn: "column_three"
    }
  ]
};

export const IPartialConfigSyncMock: IConfigSync = {
  localTable: "table_name",
  localIdColumns: {
    recordId: "record_id",
    primaryKey: "id"
  },
  syncFlag: {
    columnName: "flag",
    true: true,
    false: false
  },
  columns: [
    {
      airtableColumn: "Column one",
      localColumn: "column_one"
    },
    {
      airtableColumn: "Column two",
      localColumn: "column_two"
    },
    {
      airtableColumn: "Column three",
      localColumn: "column_three"
    }
  ]
};

export const IConfigMock: IConfig = {
  airtableApiKey: "apiTestValueKey",
  airtableBaseId: "appTestValueBase",
  airtableTableId: "tableId",
  databaseClass: "sqlite3",
  databaseOptions: {},
  localIdColumns: {
    recordId: "record_id",
    primaryKey: "key"
  },
  syncFlag: {
    columnName: "to_sync",
    true: true,
    false: false
  },
  syncs: [IPartialConfigSyncMock]
};

export const IQueryResultMock: IQueryResult[] = [
  {
    column_one: 1,
    column_two: "bar",
    column_three: "baz",
    airtable_record_id: "rec1231"
  },
  {
    column_one: 2,
    column_two: "bar",
    column_three: "baz",
    airtable_record_id: "rec1232"
  },
  {
    column_one: 3,
    column_two: "bar",
    column_three: "baz",
    airtable_record_id: "rec1233"
  }
];

export const SyncClassMock = new Sync(IFullConfigSyncMock);
export const SyncRowClassMock = new SyncRow(
  SyncClassMock,
  null,
  IQueryResultMock
);
