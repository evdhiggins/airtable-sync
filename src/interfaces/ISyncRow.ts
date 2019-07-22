import * as Airtable from 'airtable';
import { AirtableConfig, QueryResult } from "../types";

export default interface ISyncRow {
  airtableId(): string;
  setAirtableId(id: string): void;
  airtableRow(): Airtable.RecordData;
  airtableConfig(): AirtableConfig;
  localId(): string;
  localRow(): QueryResult;
  lookupByLocalId(): string;
}
