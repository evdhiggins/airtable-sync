import Airtable = require("Airtable");
import IAirtable from "../interfaces/IAirtableSync";
import { SyncRow } from "./SyncRow";
import { QueryResult } from "../types";

export class AirtableSync implements IAirtable {
  private async addRow(
    table: Airtable.Table,
    airtableData: QueryResult
  ): Promise<string> {
    const record: Airtable.Record = await table.create(airtableData);
    return record.getId();
  }

  public async delete(row: SyncRow): Promise<Airtable.RecordData> {
    const { apiKey, baseId, tableId } = row.airtableConfig();
    const table: Airtable.Table = new Airtable({
      apiKey
    }).base(baseId)(tableId);
    try {
      const deletedRecord: Airtable.Record = await table.find(row.airtableId());
      await table.destroy(row.airtableId());
      return deletedRecord.fields;
    } catch (err) {
      console.warn("Error deleting row: ");
      console.warn(err.message);
      return {};
    }
  }

  public async update(row: SyncRow): Promise<void> {
    const { apiKey, baseId, tableId } = row.airtableConfig();
    const table: Airtable.Table = new Airtable({
      apiKey
    }).base(baseId)(tableId);

    const airtableData: QueryResult = row.airtableRow();
    const localIdLookup: string = row.lookupByLocalId();

    if (localIdLookup) {
      const records: Airtable.Record[] = await table
        .select({
          filterByFormula: `{${localIdLookup}} = "${row.localId()}"`,
          pageSize: 1
        })
        .firstPage();

      if (records[0]) {
        await table.update(records[0].getId(), airtableData);
        row.setAirtableId(records[0].getId());
        return;
      }
    }

    if (!row.airtableId()) {
      const id: string = await this.addRow(table, airtableData);
      row.setAirtableId(id);

      return;
    }

    try {
      // attempt to update an existing row
      await table.update(row.airtableId(), airtableData);
    } catch (e) {
      // if the item's record id is not found, add a new row and acquire new record id
      if (/not *found/i.test(e.message)) {
        const id: string = await this.addRow(table, airtableData);
        row.setAirtableId(id);
        return;
      }
      throw e;
    }
  }
}

export default function(): AirtableSync {
  return new AirtableSync();
}
