import assert = require("assert");
import IAssertionTests from "./interfaces/IAssertionTests";
import { ISchemaAssertions as schema } from "./interfaces/ISchema";
import { ColumnAssertions as column } from "./types/Column";

type Tests = {
  [index: string]: IAssertionTests;
};

const tests: Tests = {
  column,
  schema
};

export default (type: string, key: string, value: any): void => {
  if (tests[type] && tests[type][key]) {
    const assertionError: boolean | string = tests[type][key].assertion(value);
    const errmsg: string =
      tests[type][key].errmsg || (assertionError as string);
    try {
      assert(!assertionError, errmsg);
      return;
    } catch (err) {
      throw new Error(
        `Assertion error in ${type} for ${key} value ${value}: ${err.message}`
      );
    }
  }
  throw new Error(`Key "${key}" in type "${type}" not found.`);
};
