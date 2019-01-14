import { ISyncMaster, Config, Schema, IQueryResult, IColumn } from "src/types";
import SyncClass from "./Sync.class";
import SyncRowClass from "./SyncRow.class";
import src from "./../sync";
const { airtable, createSync, getDatabase } = src;

async function sleep(miliseconds: number): Promise<any> {
  return new Promise(res => {
    setTimeout(() => res(), miliseconds);
  });
}

export default class SyncMaster implements ISyncMaster {
  private _config: Config;
  private _syncs: SyncClass[] = [];

  constructor(config: Config) {
    this._config = config;
  }

  addSync(schema: Schema): this {
    this._syncs.push(createSync(schema, this._config));
    return this;
  }

  setConfig(config: Config): this {
    this._config = Object.assign({}, this._config, config);
    return this;
  }

  config(): Config {
    return this._config;
  }

  async run(): Promise<this> {
    const syncRows: SyncRowClass[] = await this._syncs.reduce(
      async (accPromise: Promise<SyncRowClass[]>, sync: SyncClass) => {
        const acc: SyncRowClass[] = await accPromise;

        // get & initialize database class from configuration
        sync.database = new (getDatabase(sync.databaseClass))(
          sync.databaseOptions
        );
        const results: IQueryResult[] = await sync.database.fetchRowsToSync(
          sync
        );

        // transform query results into array of SyncRows
        return acc.concat(sync.getSyncRows(results));
      },
      Promise.resolve([])
    );

    console.log(`Processing ${syncRows.length} syncRows`);

    // tslint:disable-next-line
    for (let i in Object.keys(syncRows)) {
      console.log(
        `${syncRows[i].localTable}: Airtable update: ${syncRows[i].primaryKey}`
      );

      // tslint:disable-next-line
      for (let c in syncRows[i].columns) {
        const column: IColumn = syncRows[i].columns[c];
        if (column.linkedColumn) {
          syncRows[i].columns[c] = await syncRows[
            i
          ].database.fetchLinkedRecords(column);
        }
      }

      airtable.update(syncRows[i]).then(async syncRow => {
        console.log(`${syncRow.localTable}: Local update: ${syncRow.recordId}`);
        syncRow.database.updateSyncedRows(syncRow);
      });

      // wait 650 miliseconds between each call to avoid ever hitting the 5 calls / second api limit
      // each airtable update call might call the Airtable api up to 3x,
      // meaning the max call rate is limited to ~4.6x / second
      await sleep(650);
    }
    return this;
  }
}
