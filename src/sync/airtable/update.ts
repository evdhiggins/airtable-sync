import { QueryResult } from "../../types";
import { SyncRow } from "../../classes/SyncRow.class";
import Airtable = require("Airtable");

async function addRow(
  table: Airtable.Table,
  airtableData: QueryResult,
): Promise<string> {
  const record: Airtable.Record = await table.create(airtableData);
  return record.getId();
}

export default async (table: Airtable.Table, syncRow: SyncRow) => {
  const airtableData: QueryResult = syncRow.airtableRow();
  const localIdLookup: string = syncRow.lookupByLocalId();

  if (localIdLookup) {
    const records: Airtable.Record[] = await table
      .select({
        filterByFormula: `{${localIdLookup}} = "${syncRow.localId()}"`,
        pageSize: 1,
      })
      .firstPage();

    if (records[0]) {
      await table.update(records[0].getId(), airtableData);
      syncRow.setAirtableId(records[0].getId());
      return;
    }
  }

  if (!syncRow.airtableId()) {
    const id: string = await addRow(table, airtableData);
    syncRow.setAirtableId(id);

    return;
  }

  try {
    // attempt to update an existing row
    await table.update(syncRow.airtableId(), airtableData);
  } catch (e) {
    // if the item's record id is not found, add a new row and acquire new record id
    if (/not *found/i.test(e.message)) {
      const id: string = await addRow(table, airtableData);
      syncRow.setAirtableId(id);
      return;
    }
    throw e;
  }
};
