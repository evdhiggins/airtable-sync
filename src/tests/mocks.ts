import { QueryResult, Column } from "../types";
import { LocalSchema } from "../interfaces/ISchema";

export const QueryResultMock: QueryResult[] = [
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

export const localSchemaMock: LocalSchema = {
  tableName: "test_tb",
  syncFlag: {
    columnName: "sync_flag",
    true: "T",
    false: "F",
  },
  idColumns: {
    local: "id",
    airtable: "record_id",
  },
};

export const columnsMock: Column[] = [
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
];

export const rowMock: any = {
  id: 1,
  column_one: "foo",
  column_two: "bar",
  column_three: "baz",
  record_id: "rec1231",
};
