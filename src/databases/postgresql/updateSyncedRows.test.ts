import updateSyncedRows from "./updateSyncedRows";
import * as PGP from 'pg-promise';
import { LocalSchema } from "src/interfaces/ISchema";


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

const rowMock = {
  record_id: 'rec123',
  id: 123,
}


describe("postgresql updateSyncedRows: It should... ", () => {
  let none: jest.Mock<any>;
  let pg: PGP.IDatabase<any>;
  let calledSql: string;
  let preparedSql: string;
  beforeEach(async (done) => {
    none = jest.fn((sql, params) => {
      calledSql = sql;
      preparedSql = PGP.as.format(sql, params, { partial: true });
      return []
    })
    pg = { none } as unknown as PGP.IDatabase<any>;
    await updateSyncedRows(pg, localSchemaMock, rowMock);
    done();
  })


  test("Call pg.none with correct raw SQL", () => {
    const expectedSql = `
UPDATE $[tableName:name]
SET $[syncColumnName:name] = $[syncColumnFalse],
  $[airtableIdColumnName:name] = $[airtableId]
WHERE $[primaryKeyColumnName:name] = $[localId];
`;
    expect(calledSql).toBe(expectedSql);
  });

  test("Raw SQL should evaluate as expected formatted SQL", () => {
    const expectedSql = `
UPDATE "test_tb"
SET "sync_flag" = 'F',
  "record_id" = 'rec123'
WHERE "id" = 123;
`;
    expect(preparedSql).toBe(expectedSql);
  });
});
