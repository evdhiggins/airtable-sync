import { QueryResult, Column } from "../types";
import { LocalSchema } from "./ISchema";
import { LinkedColumnDetails } from "./ISyncColumn";

export default interface IDatabase {
  /**
   * Retrieve all data that is to be synced with Airtable
   */
  getRowsToSync(schema: LocalSchema, columns: Column[]): Promise<QueryResult[]>;

  /**
   * Fetch all airtable record ID's for an array of linked columns
   * If no record id is found no value is returned for the respective linkedColumn
   * @param linkedColumns
   */
  fetchLinkedRecords(
    linkDetails: LinkedColumnDetails,
    value: any
  ): Promise<any[]>;

  /**
   * Update all synced rows, adding Airtable record ID's and updating flags
   * @param updateQuery
   */
  updateSyncedRow(schema: LocalSchema, row: any): Promise<void>;
}
