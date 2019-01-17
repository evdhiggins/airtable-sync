import { ISyncMaster, Config } from "../types";
import SyncFactory, { Sync } from "./Sync";
import ISchema from "../interfaces/ISchema";
import handleError from "../handleError";
import IDatabase from "../interfaces/IDatabase";
import { AirtableSync } from "./AirtableSync";
import DatabaseFactory from "../databases";

export default class SyncMaster implements ISyncMaster {
  private _config: Config;
  private _syncs: Sync[] = [];

  constructor(config: Config) {
    this._config = config;
  }

  addSync(schema: ISchema): this {
    try {
      const sync: Sync = SyncFactory(schema, this._config);
      const { name, options } = this._config.database;
      const db: IDatabase = DatabaseFactory(name, options);
      const airtable: AirtableSync = new AirtableSync();
      sync.setDatabase(db);
      sync.setAirtable(airtable);
      this._syncs.push(sync);
      return this;
    } catch (e) {
      handleError(e);
    }
  }

  setConfig(config: Config): this {
    this._config = Object.assign({}, this._config, config);
    return this;
  }

  config(): Config {
    return this._config;
  }

  async run(): Promise<void> {
    try {
      // a standard for-loop easily forces the syncs to be run synchronously
      for (const sync of this._syncs) {
        await sync.run();
      }
    } catch (e) {
      handleError(e);
    }
  }
}
