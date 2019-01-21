import IDatabase from "./IDatabase";
import { SyncRunReport } from "src/types";

export default interface ISync {
  setDatabase(db: IDatabase): this;
  setAirtable(at: any): this;
  run(): Promise<SyncRunReport>;
}
