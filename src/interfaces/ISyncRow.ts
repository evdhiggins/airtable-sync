import Airtable = require("Airtable");
import { AirtableConfig } from "../types";

export default interface ISyncRow {
  airtableId(): string;
  setAirtableId(id: string): void;
  airtableRow(): Airtable.RecordData;
  airtableConfig(): AirtableConfig;
  localId(): string;
  lookupByLocalId(): string;
}
