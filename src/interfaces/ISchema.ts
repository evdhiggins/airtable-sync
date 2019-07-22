import * as Airtable from 'airtable';
import { Column, QueryResult } from "../types";
import IAssertionTests from "./IAssertionTests";

export type AirtableSchema = {
  [index: string]: string | boolean;
  tableId?: string;
  baseId?: string;
  apiKey?: string;
  lookupByPrimaryKey?: boolean;
};

export type LocalSchema = {
  [index: string]: any;
  tableName: string;
  syncFlag: {
    columnName: string;
    true: boolean | number | string;
    false: boolean | number | string;
  };
  idColumns: {
    local: string;
    airtable: string;
  };
};

export namespace Filter {
  export type Action = "removeFromAirtable" | "skipSync" | ActionFunction;
  export type ActionFunction = (row: QueryResult) => void;
  export type MatchFunction = (value: any) => boolean;
  export type RemoveFromAirtableCallback = (row: Airtable.RecordData) => void;
}

export type Filter = {
  type: "column" | "row";
  localColumn?: string;
  match: RegExp | string | Filter.MatchFunction;
  actions: Filter.Action[];
  removeFromAirtableCallback?: Filter.RemoveFromAirtableCallback;
};

export default interface ISchema {
  airtable: AirtableSchema;
  local: LocalSchema;
  columns: Column[];
  filters?: Filter[];
  name?: string;
}

/**
 * A set of tests used to validate provided schemas. Validation
 * errors will result in an AssertionError being thrown
 */
export const ISchemaAssertions: IAssertionTests = {
  airtableSchema: {
    assertion(value: any): string {
      return typeof value === "object"
        ? ""
        : "AirtableSchema is required (`schema.airtable`)";
    }
  },
  localSchema: {
    assertion(value: any): string {
      return typeof value === "object"
        ? ""
        : "LocalSchema is required (`schema.local`)";
    }
  },
  tableName: {
    assertion(value: string): boolean {
      return typeof value !== "string" || value === "";
    },
    errmsg: "`local.tableName` is required and must be type 'string'"
  },
  syncFlag: {
    assertion(value: any): string {
      switch (true) {
        case !value:
          return "local.syncFlag is required";
        case typeof value.columnName !== "string":
          return "`local.syncFlag.columnName` is required and must be type 'string'";
        default:
          return "";
      }
    }
  },
  idColumns: {
    assertion(value: { local: string; airtable: string }): string {
      switch (true) {
        case !value:
          return "`local.idColumns` is required";
        case typeof value.local !== "string" || value.local === "":
          return "`local.idColumns.local` must be a non-empty string";
        case typeof value.airtable !== "string" || value.airtable === "":
          return "`local.idColumns.airtable` must be a non-empty string";
      }
    }
  },
  tableId: {
    assertion(value: string): string {
      return /tbl\w{14}/.test(value)
        ? ""
        : "`airtable.tableId` is required. Table ID must be 17 characters long and start with 'tbl'";
    }
  },
  baseId: {
    assertion(value: string): string {
      return /app\w{14}/.test(value)
        ? ""
        : "`airtable.baseId` is required. Base ID must be 17 characters long and start with 'app'";
    }
  },
  apiKey: {
    assertion(value: string): string {
      return /key\w{14}/.test(value)
        ? ""
        : "`airtable.apiKey` is required. API key must be 17 characters long and start with 'key'";
    }
  },
  filters: {
    assertion(filters: Filter[]): string {
      if (Array.isArray(filters)) {
        return "";
      }
      return "`schema.filters` must be an Array";
    }
  },
  filter: {
    assertion(filter: Filter): string {
      switch (true) {
        // filter.type
        case filter.type !== "column" && filter.type !== "row":
          return '`filter.type` must be either "column" or "row"';

        // filter.localColumn
        case filter.type === "column" &&
          (typeof filter.localColumn !== "string" || !filter.localColumn):
          return 'Filters with type "column" must specify a valid `localColumn`';

        // filter.match
        case !(filter.match instanceof RegExp) &&
          typeof filter.match !== "string" &&
          typeof filter.match !== "function":
          return "`filter.match` must be either a RegExp, string, or function";

        // filter.actions
        case filter.actions.filter(
          act =>
            !["removeFromAirtable", "skipSync"].includes(
              (act as unknown) as string
            ) && typeof act !== "function"
        ).length > 0:
          return "All filter actions must be either `removeFromAirtable`, `skipSync`, or a custom function";

        // f
        case filter.removeFromAirtableCallback &&
          typeof filter.removeFromAirtableCallback !== "function":
          return "`filter.removeFromAirtableCallback` must be a function";
        default:
          return "";
      }
    }
  }
};
