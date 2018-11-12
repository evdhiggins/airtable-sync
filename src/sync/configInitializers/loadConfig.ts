import { IConfig } from "src/types";
import { PathLike, existsSync } from "fs";

export default (configPath: any): IConfig => {
  if (typeof configPath !== "string") {
    throw new TypeError("configPath must be type 'string'");
  }
  if (!configPath || !existsSync(configPath)) {
    throw new TypeError("configPath must be valid path");
  }
  if (!/.+\.(js(on)?)/.test(configPath)) {
    throw new TypeError(`Config file is not of valid filetype (.js, .json)`);
  }
  const config: IConfig = require(configPath);
  return config;
};
