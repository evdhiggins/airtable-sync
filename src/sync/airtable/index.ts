import Airtable = require("Airtable");
import IAirtable from "../../interfaces/IAirtable";
import updateAirtable from "./update";
import { SyncRow } from "../../classes/SyncRow.class";

export default class implements IAirtable {
  async update(row: SyncRow): Promise<void> {
    const { apiKey, baseId, tableId } = row.airtableConfig();
    const table: Airtable.Table = new Airtable({
      apiKey,
    }).base(baseId)(tableId);

    await updateAirtable(table, row);
  }
}
