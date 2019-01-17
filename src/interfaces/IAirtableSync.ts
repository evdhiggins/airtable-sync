import { SyncRow } from "../classes/SyncRow";

export default interface IAirtable {
  update(row: SyncRow): Promise<void>;
}
