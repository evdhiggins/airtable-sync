import { SyncRow } from "../classes/SyncRow.class";

export default interface IAirtable {
  update(row: SyncRow): Promise<void>;
}
