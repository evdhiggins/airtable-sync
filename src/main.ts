require("dotenv").config();
import src from "./sync";
import { IConfig, IDatabase, IQueryResult } from "./types";
import { PathLike } from "fs";
import { resolve } from "path";
import Sync from "./classes/Sync.class";
import SyncRow from "./classes/SyncRow.class";

const { airtable, configInitializers, getDatabase } = src;

async function wait(miliseconds: number): Promise<any> {
  return new Promise((res) => {
    setTimeout(() => res(), miliseconds);
  });
}

export default async (): Promise<void> => {
  const configPath: PathLike = resolve(
    __dirname,
    "../",
    process.env.CONFIG_PATH || "config.js",
  );

  const config: IConfig = configInitializers.loadConfig(configPath);
  const syncs: Sync[] = configInitializers.processConfig(config);
  const syncRows: SyncRow[] = await syncs.reduce(
    async (accPromise: Promise<SyncRow[]>, sync: Sync) => {
      const acc: SyncRow[] = await accPromise;

      // get & initialize database class from configuration
      sync.database = new (getDatabase(sync.databaseClass))(
        sync.databaseOptions,
      );
      const results: IQueryResult[] = await sync.database.fetchRowsToSync(sync);

      // transform query results into array of SyncRows
      return acc.concat(sync.getSyncRows(results));
    },
    Promise.resolve([]),
  );

  // tslint:disable-next-line
  for (let i in Object.keys(syncRows)) {
    airtable.update(syncRows[i]).then((syncRow) => {
      syncRow.database.updateSyncedRows(syncRow);
    });

    // wait 500 miliseconds between each call to avoid ever hitting the 5 calls / second api limit
    // each airtable update call might call the Airtable api up to 2x,
    // meaning the max call rate is limited to 4x / second
    await wait(500);
  }
};
