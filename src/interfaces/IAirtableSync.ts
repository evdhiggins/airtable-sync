import Airtable = require("Airtable");
import { SyncRow } from "../classes/SyncRow";

export default interface IAirtable {
  delete(row: SyncRow): Promise<Airtable.RecordData>;
  update(row: SyncRow): Promise<void>;
}
