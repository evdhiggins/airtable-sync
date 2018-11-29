import { IConfig, IQueryResult, IConfigSync } from "../types";
import SyncClass from "../classes/Sync.class";
import SyncRowClass from "../classes/SyncRow.class";

export const IFullConfigSyncMock: IConfigSync = {
  localTable: "test_tb",
  airtableApiKey: "key",
  airtableBaseId: "base",
  airtableTableId: "table",
  databaseClass: "sqlite3",
  databaseOptions: {
    path: "./path/to/db",
  },
  localIdColumns: {
    recordId: "record_id",
    primaryKey: "id",
  },
  syncFlag: {
    columnName: "sync_flag",
    true: "T",
    false: "F",
  },
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
    {
      airtableColumn: "ID",
      localColumn: "id",
    },
  ],
};

export const IPartialConfigSyncMock: IConfigSync = {
  localTable: "table_name",
  localIdColumns: {
    recordId: "record_id",
    primaryKey: "id",
  },
  syncFlag: {
    columnName: "sync_flag",
    true: "T",
    false: "F",
  },
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

export const IConfigMock: IConfig = {
  airtableApiKey: "apiTestValueKey",
  airtableBaseId: "appTestValueBase",
  airtableTableId: "tblTableId",
  databaseClass: "sqlite3",
  databaseOptions: {},
  localIdColumns: {
    recordId: "record_id",
    primaryKey: "id",
  },
  syncFlag: {
    columnName: "flag",
    true: "T",
    false: "F",
  },
  syncs: [IPartialConfigSyncMock],
};

export const IQueryResultMock: IQueryResult[] = [
  {
    id: 1,
    column_one: "foo",
    column_two: "bar",
    column_three: "baz",
    record_id: "rec1231",
  },
  {
    id: 2,
    column_one: "foo2",
    column_two: "bar2",
    column_three: "baz2",
    record_id: "rec1232",
  },
  {
    id: 3,
    column_one: "foo3",
    column_two: "bar3",
    column_three: "baz3",
    record_id: "rec1233",
  },
];

export const SyncClassMock: SyncClass = new SyncClass(IFullConfigSyncMock);
export const SyncRowClassMock: SyncRowClass = new SyncRowClass(
  SyncClassMock,
  null,
  IQueryResultMock[0],
);
