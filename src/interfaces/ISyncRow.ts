import Airtable = require("Airtable");
import { AirtableConfig, QueryResult } from "../types";
import ISchema from "./ISchema";
import IDatabase from "./IDatabase";

export default interface ISyncRow {
  airtableId(): string;
  setAirtableId(id: string): void;
  airtableRow(): Airtable.RecordData;
  airtableConfig(): AirtableConfig;
  localId(): string;
  lookupByLocalId(): string;
}
