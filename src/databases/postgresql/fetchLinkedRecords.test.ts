import getLinkedRecords from "./fetchLinkedRecords";
import { LinkedColumnDetails } from "../../interfaces/ISyncColumn";
import * as PGP from 'pg-promise';


const linkDetailsMock: LinkedColumnDetails = {
  tableName: "orders",
  lookupColumn: "id",
  returnColumn: "record_id",
  multipleRecords: true,
};

const dataMock = [
  { id: 1234, record_id: 'rec4' },
  { id: 1235, record_id: 'rec5' },
  { id: 1236, record_id: 'rec6' }
];

const columnValueMock = dataMock.map(d => d.id);

describe("postgresql fetchLinkedRecords: It should... ", () => {
  let any: jest.Mock<any>;
  let pg: PGP.IDatabase<any>;
  let result: any[];
  let calledSql: string;
  let preparedSql: string;
  beforeEach(async (done) => {
    any = jest.fn(async (sql, params) => {
      calledSql = sql;
      preparedSql = PGP.as.format(sql, params, { partial: true });
      return dataMock
    })
    pg = { any } as unknown as PGP.IDatabase<any>;
    result = await getLinkedRecords(pg, linkDetailsMock, columnValueMock);
    done();
  })

  test("Return an array", () => {
    expect(Array.isArray(result)).toBe(true);
  });

  test("Call pg.any with correct raw SQL", () => {
    const expectedSql = `
SELECT $[returnColumn:name]
FROM $[tableName:name]
WHERE $[lookupColumn:name] IN ($[params:csv])
  AND $[returnColumn:name] IS NOT NULL;
`;
    expect(calledSql).toBe(expectedSql);
  });

  test("Raw SQL should evaluate as expected formatted SQL", () => {
    const expectedSql = `
SELECT "record_id"
FROM "orders"
WHERE "id" IN (1234,1235,1236)
  AND "record_id" IS NOT NULL;
`;
    expect(preparedSql).toBe(expectedSql);
  });

  test("Return an empty array if no columnValues are received", async (done) => {
    const emptyArrayResult = await getLinkedRecords(pg, linkDetailsMock, []);
    expect(emptyArrayResult).toStrictEqual([]);
    done();
  });

  test("Return an empty array if columnValues is falsey", async (done) => {
    const emptyArrayResult = await getLinkedRecords(pg, linkDetailsMock, '');
    expect(emptyArrayResult).toStrictEqual([]);
    done();
  });

  test("Return an array of expected returnColumn values", () => {
    expect(result).toStrictEqual(dataMock.map(d => d.record_id));
  });
});
