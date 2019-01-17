import IDatabase from "./IDatabase";

export default interface ISync {
  setDatabase(db: IDatabase): this;
  setAirtable(at: any): this;
  run(): Promise<void>;
}
