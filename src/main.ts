require("dotenv").config();
import src from "./sync/index";
import { IConfig, ISync } from "./types";
import { PathLike } from "fs";
import { resolve } from "path";

const { configInitializers } = src;

export default async (): Promise<void> => {
  const configPath: PathLike = resolve(
    __dirname,
    "../",
    process.env.CONFIG_PATH || "config.js",
  );
  const config: IConfig = configInitializers.loadConfig(configPath);
  const syncs: ISync[] = configInitializers.processConfig(config);
};
