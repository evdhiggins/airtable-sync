import { IQueryResult } from "../../types";
import SyncRow from "../../classes/SyncRow.class";
import Airtable = require("Airtable");

async function addRow(
  table: Airtable.Table,
  airtableData: IQueryResult
): Promise<string> {
  const record = await table.create(airtableData);
  return record.getId();
}

export default async (table: Airtable.Table, syncRow: SyncRow) => {
  const airtableData: IQueryResult = syncRow.columns.reduce(
    (acc: IQueryResult, column) => {
      acc[column.airtableColumn] = column.value;
      return acc;
    },
    {}
  );

  if (!syncRow.recordId) {
    syncRow.recordId = await addRow(table, airtableData);
    return syncRow;
  }

  // attempt to update an existing row
  try {
    await table.update(syncRow.recordId, airtableData);
    return syncRow;
  } catch (e) {
    // if the item's record id is not found, add a new row and acquire new record id
    if (/not *found/i.test(e.message)) {
      syncRow.recordId = await addRow(table, airtableData);
      return syncRow;
    }
    throw e;
  }
};
