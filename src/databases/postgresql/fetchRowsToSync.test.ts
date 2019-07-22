import fetchRowsToSync from "./fetchRowsToSync";
import { Column } from "../../types";
import * as PGP from 'pg-promise';
import { LocalSchema } from "src/interfaces/ISchema";

const columnsMock: Column[] = [
  {
    airtableColumn: "Column one",
    localColumn: "column_one",
  },
  {
    airtableColumn: "ID",
    localColumn: "id",
  },
  {
    airtableColumn: "Record ID",
    localColumn: "record_id",
  },
];

const localSchemaMock: LocalSchema = {
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


describe("postgresql fetchRowsToSync: It should... ", () => {
  let any: jest.Mock<any>;
  let pg: PGP.IDatabase<any>;
  let result: any[];
  let calledSql: string;
  let preparedSql: string;
  beforeEach(async (done) => {
    any = jest.fn((sql, params) => {
      calledSql = sql;
      preparedSql = PGP.as.format(sql, params, { partial: true });
      return []
    })
    pg = { any } as unknown as PGP.IDatabase<any>;
    result = await fetchRowsToSync(pg, localSchemaMock, columnsMock);
    done();
  })

  test("Return an array", () => {
    expect(Array.isArray(result)).toBe(true);
  });

  test("Call pg.any with correct raw SQL", () => {
    const expectedSql = `
SELECT $[dbColumns:name]
FROM $[tableName:name]
WHERE $[syncColumnName:name] = $[syncFlagTrue]
`;
    expect(calledSql).toBe(expectedSql);
  });

  test("Raw SQL should evaluate as expected formatted SQL", () => {
    const expectedSql = `
SELECT "column_one","id","record_id"
FROM "test_tb"
WHERE "sync_flag" = 'T'
`;
    expect(preparedSql).toBe(expectedSql);
  });

  test("Add airtable id to selected columns if not included in columns", async (done) => {
    await fetchRowsToSync(pg, localSchemaMock, [{
      airtableColumn: 'Column One',
      localColumn: 'column_one'
    },
    {
      airtableColumn: 'ID',
      localColumn: 'id',
    }
    ]);
    const expectedSql = `
SELECT $[dbColumns:name]
FROM $[tableName:name]
WHERE $[syncColumnName:name] = $[syncFlagTrue]
`;
    expect(any.mock.calls[1][0]).toEqual(expectedSql);
    done();
  });

  test("Add local id to selected columns if not included in columns", async (done) => {
    await fetchRowsToSync(pg, localSchemaMock, [{
      airtableColumn: 'Column One',
      localColumn: 'column_one'
    },
    {
      airtableColumn: 'Record Id',
      localColumn: 'record_id',
    }
    ]);
    const expectedSql = `
SELECT $[dbColumns:name]
FROM $[tableName:name]
WHERE $[syncColumnName:name] = $[syncFlagTrue]
`;
    expect(any.mock.calls[1][0]).toEqual(expectedSql);
    done();
  });
});
