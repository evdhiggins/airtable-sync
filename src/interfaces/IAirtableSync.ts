import * as Airtable from 'airtable';
import { SyncRow } from "../classes/SyncRow";

export default interface IAirtable {
  delete(row: SyncRow): Promise<Airtable.RecordData>;
  update(row: SyncRow): Promise<void>;
}
