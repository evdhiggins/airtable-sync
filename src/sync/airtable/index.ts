import Airtable = require("Airtable");
import SyncRow from "../../classes/SyncRow.class";
import updateAirtable from "./update";

async function update(syncRow: SyncRow): Promise<SyncRow> {
  const table: Airtable.Table = new Airtable({
    apiKey: syncRow.airtableApiKey,
  }).base(syncRow.airtableBaseId)(syncRow.airtableTableId);

  // updateAirtable mutates the syncRow object, adding the record id if a valid one doesn't exist
  updateAirtable(table, syncRow);
  return syncRow;
}

export default { update };
