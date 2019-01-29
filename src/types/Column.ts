import IAssertionTests from "../interfaces/IAssertionTests";

export type Column = {
  localColumn: string;
  airtableColumn: string;
  prepare?: (cell: any) => any;
  linkedColumn?: boolean;
  linkedTableName?: string;
  linkedLookupColumn?: string;
  linkedReturnColumn?: string;
  multipleRecords?: boolean;
  value?: any;
};

export const ColumnAssertions: IAssertionTests = {
  localColumn: {
    assertion(value: string): string {
      if (typeof value !== "string" || value === "") {
        return "`localColumn` must be a non-empty string";
      }
      return "";
    }
  },
  airtableColumn: {
    assertion(value: string): string {
      if (typeof value !== "string" || value === "") {
        return "`airtableColumn` must be a non-empty string";
      }
      return "";
    }
  },
  prepare: {
    assertion(value: any): string {
      if (typeof value === "function" || typeof value === "undefined") {
        return "";
      }
      return "`prepare` must be either a `function` or `undefined`";
    }
  },
  linkedColumn: {
    assertion(value: boolean): string {
      if (typeof value === "boolean" || typeof value === "undefined") {
        return "";
      }
      return "`linkedColumn` must be either a `boolean` or `undefined`";
    }
  },
  linkedTableName: {
    assertion(value: string): string {
      if (typeof value !== "string" || value === "") {
        return "`linkedTableName` must be a non-empty string";
      }
      return "";
    }
  },
  linkedLookupColumn: {
    assertion(value: string): string {
      if (typeof value !== "string" || value === "") {
        return "`linkedLookupColumn` must be a non-empty string";
      }
      return "";
    }
  },
  linkedReturnColumn: {
    assertion(value: string): string {
      if (typeof value !== "string" || value === "") {
        return "`linkedReturnColumn` must be a non-empty string";
      }
      return "";
    }
  },
  multipleRecords: {
    assertion(value: boolean): string {
      if (typeof value === "boolean" || typeof value === "undefined") {
        return "";
      }
      return "`multipleRecords` must be either a `boolean` or `undefined`";
    }
  }
};
