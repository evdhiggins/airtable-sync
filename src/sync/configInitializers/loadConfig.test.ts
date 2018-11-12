import lc from "./loadConfig";
import { PathLike } from "fs";
import { resolve } from "path";
import { IConfig } from "src/types";
import { ITestFn } from "../../tests/types";

// assign loadConfig to factory
const loadConfig: ITestFn = (arg) => () => lc(arg);

const validPathValidFiletype: PathLike = resolve(
  __dirname,
  "../../../examples/config.js",
);
const invalidPathValidFiletype: PathLike = resolve(
  __dirname,
  "../../../examples/filename-that-will-never-exist.js",
);
const validPathInvalidFiletype: PathLike = resolve(
  __dirname,
  "../../../examples/example.env",
);

describe("loadConfig: It should...", () => {
  describe("Throw an error if script path...", () => {
    test("Isn't a string", () => {
      const errMsg: string = "configPath must be type 'string'";
      expect(loadConfig(123)).toThrowError(errMsg);
      expect(loadConfig(undefined)).toThrowError(errMsg);
      expect(loadConfig(null)).toThrowError(errMsg);
    });
    test("Isn't valid filetype", () => {
      expect(loadConfig(validPathInvalidFiletype)).toThrow();
    });
    test("Is for a file that doesn't exist", () => {
      expect(loadConfig(invalidPathValidFiletype)).toThrow();
    });
  });

  test("Work with a valid filepath", () => {
    expect(loadConfig(validPathValidFiletype)).not.toThrow();
  });
  test("Return a value", () => {
    const result: IConfig = lc(validPathValidFiletype);
    expect(result).toBeDefined();
  });
});
