require("jest");
import SyncColumnFactory, { SyncColumn } from "./SyncColumn";
import { Column } from "../types";
import { LinkedColumnDetails } from "src/interfaces/ISyncColumn";

const localColumnValue: string = "local_column";
const airtableColumnValue: string = "Airtable Column";
const linkedTableNameValue: string = "another_table";
const linkedLookupColumnValue: string = "another_id";
const linkedReturnColumnValue: string = "another_value";

const basicColumnMockFactory: (v?: boolean) => Column = (
  linkedColumn: boolean = false
) => {
  const column: Column = {
    localColumn: localColumnValue,
    airtableColumn: airtableColumnValue
  };
  if (linkedColumn) {
    column.linkedColumn = true;
  }
  return column;
};

const linkDetailsMockFactory: () => any = () => ({
  linkedTableName: linkedTableNameValue,
  linkedLookupColumn: linkedLookupColumnValue,
  linkedReturnColumn: linkedReturnColumnValue,
  multipleRecords: true
});

const columnMockFactory: () => Column = () =>
  Object.assign(basicColumnMockFactory(true), linkDetailsMockFactory());

describe("SyncColumn Class", () => {
  describe("Creation", () => {
    test("Don't throw an error when created with minimum basic params", () => {
      const createFunc: any = () =>
        SyncColumnFactory(basicColumnMockFactory(), "value");
      expect(createFunc).not.toThrow();
    });

    test("Don't throw an error when created with all params", () => {
      const createFunc: any = () => {
        const columnMock: Column = Object.assign(
          basicColumnMockFactory(),
          linkDetailsMockFactory()
        );
        columnMock.linkedColumn = true;
        return SyncColumnFactory(columnMock, "value");
      };
      expect(createFunc).not.toThrow();
    });

    test("Throw an error when `localColumn` is missing", () => {
      const createFunc: any = () => {
        const columnMock: Column = basicColumnMockFactory();
        delete columnMock.localColumn;
        return SyncColumnFactory(columnMock, "value");
      };
      expect(createFunc).toThrow();
    });

    test("Throw an error when `airtableColumn` is missing", () => {
      const createFunc: any = () => {
        const columnMock: Column = basicColumnMockFactory();
        delete columnMock.airtableColumn;
        return SyncColumnFactory(columnMock, "value");
      };
      expect(createFunc).toThrow();
    });

    test("Throw an error when `linkedColumn` is true and `linkedTableName` is missing", () => {
      const createFunc: any = () => {
        const columnMock: Column = columnMockFactory();
        delete columnMock.linkedTableName;
        return SyncColumnFactory(columnMock, "value");
      };
      expect(createFunc).toThrow();
    });

    test("Throw an error when `linkedColumn` is true and `linkedLookupColumn` is missing", () => {
      const createFunc: any = () => {
        const columnMock: Column = columnMockFactory();
        delete columnMock.linkedLookupColumn;
        return SyncColumnFactory(columnMock, "value");
      };
      expect(createFunc).toThrow();
    });

    test("Throw an error when `linkedColumn` is true and `linkedReturnColumn` is missing", () => {
      const createFunc: any = () => {
        const columnMock: Column = columnMockFactory();
        delete columnMock.linkedReturnColumn;
        return SyncColumnFactory(columnMock, "value");
      };
      expect(createFunc).toThrow();
    });

    test("Throw an error when `value` is `undefined`", () => {
      const createFunc: any = () =>
        SyncColumnFactory(basicColumnMockFactory(), undefined);
      expect(createFunc).toThrow();
    });

    // null values are used to "un-set" airtable values of any type
    test("Don't throw an error when `value` is `null`", () => {
      const createFunc: any = () =>
        SyncColumnFactory(basicColumnMockFactory(), null);
      expect(createFunc).not.toThrow();
    });
  });

  describe("Methods with basic column", () => {
    let syncColumn: SyncColumn;
    const columnValue: string = "Column value";
    beforeEach(() => {
      syncColumn = SyncColumnFactory(basicColumnMockFactory(), columnValue);
    });

    test(`\`airtableColumn()\` should return "${airtableColumnValue}"`, () => {
      expect(syncColumn.airtableColumn()).toBe(airtableColumnValue);
    });

    test(`\`airtableValue()\` should return "${columnValue}"`, () => {
      expect(syncColumn.airtableValue()).toBe(columnValue);
    });

    test("`isLinked()` should return `false`", () => {
      expect(syncColumn.isLinked()).toBe(false);
    });

    test("`linkedColumnDetails()` should return an object containing empty values", () => {
      const linkDetails: LinkedColumnDetails = syncColumn.linkedColumnDetails();
      expect(linkDetails.lookupColumn).toBe("");
      expect(linkDetails.returnColumn).toBe("");
      expect(linkDetails.tableName).toBe("");
      expect(linkDetails.multipleRecords).toBe(false);
    });

    test("`setAirtableValue()` should properly change `value`", () => {
      expect(syncColumn.airtableValue()).toBe(columnValue);

      const newValue: string = "New column value";
      syncColumn.setValue(newValue);

      expect(syncColumn.airtableValue()).toBe(newValue);
    });
  });

  describe("Methods with full column", () => {
    let syncColumn: SyncColumn;
    const columnValue: string = "Column value";
    beforeEach(() => {
      syncColumn = SyncColumnFactory(columnMockFactory(), columnValue);
    });

    test(`\`airtableColumn()\` should return "${airtableColumnValue}"`, () => {
      expect(syncColumn.airtableColumn()).toBe(airtableColumnValue);
    });

    test(`\`airtableValue()\` should return "${columnValue}"`, () => {
      expect(syncColumn.airtableValue()).toBe(columnValue);
    });

    test("`isLinked()` should return `true`", () => {
      expect(syncColumn.isLinked()).toBe(true);
    });

    test("`linkedColumnDetails()` should return an object containing correct link details", () => {
      const linkDetails: LinkedColumnDetails = syncColumn.linkedColumnDetails();
      expect(linkDetails.lookupColumn).toBe(linkedLookupColumnValue);
      expect(linkDetails.returnColumn).toBe(linkedReturnColumnValue);
      expect(linkDetails.tableName).toBe(linkedTableNameValue);
      expect(linkDetails.multipleRecords).toBe(true);
    });

    test("`setAirtableValue()` should properly change `value`", () => {
      expect(syncColumn.airtableValue()).toBe(columnValue);

      const newValue: string = "New column value";
      syncColumn.setValue(newValue);

      expect(syncColumn.airtableValue()).toBe(newValue);
    });
  });

  describe("`prepare` column function", () => {
    describe("Class creation", () => {
      test("Don't throw an error when `prepare` is undefined", () => {
        const createFunc: any = () => {
          const columnMock: Column = basicColumnMockFactory();
          columnMock.prepare = undefined;
          return SyncColumnFactory(columnMock, "value");
        };
        expect(createFunc).not.toThrow();
      });

      test("Don't throw an error when `prepare` is a function", () => {
        const createFunc: any = () => {
          const columnMock: Column = basicColumnMockFactory();
          columnMock.prepare = v => v;
          return SyncColumnFactory(columnMock, "value");
        };
        expect(createFunc).not.toThrow();
      });

      test("Throw an error when `prepare` is `null` or an object", () => {
        const createFunc1: any = () => {
          const columnMock: Column = basicColumnMockFactory();
          columnMock.prepare = null;
          return SyncColumnFactory(columnMock, "value");
        };
        const createFunc2: any = () => {
          const columnMock: Column = basicColumnMockFactory();
          columnMock.prepare = ({} as unknown) as () => {};
          return SyncColumnFactory(columnMock, "value");
        };
        expect(createFunc1).toThrow();
        expect(createFunc2).toThrow();
      });
    });

    describe("`airtableValue` getter", () => {
      const columnValue: string = "Column value";
      test("`prepare` should modify returned value", () => {
        const columnMock: Column = basicColumnMockFactory();
        columnMock.prepare = v => `Wrapped ${columnValue} Wrapped`;
        const syncColumn: SyncColumn = SyncColumnFactory(
          columnMock,
          columnValue
        );
        expect(syncColumn.airtableValue()).toBe(
          `Wrapped ${columnValue} Wrapped`
        );
      });

      test("Don't throw an error when `prepare` throws error`", () => {
        const columnMock: Column = basicColumnMockFactory();
        columnMock.prepare = v => {
          throw new Error("Error!");
        };
        const syncColumn: SyncColumn = SyncColumnFactory(
          columnMock,
          columnValue
        );
        // if passed `syncColumn.airtableValue` directly, the class scope of
        // `this` is changed, breaking the test
        const testFunc: any = () => syncColumn.airtableValue();
        expect(testFunc).not.toThrow();
      });

      test("Return original column value when `prepare` throws error`", () => {
        const columnMock: Column = basicColumnMockFactory();
        columnMock.prepare = v => {
          throw new Error("Error!");
        };
        const syncColumn: SyncColumn = SyncColumnFactory(
          columnMock,
          columnValue
        );
        expect(syncColumn.airtableValue()).toBe(columnValue);
      });
    });
  });
});
