import ISyncRow from "../interfaces/ISyncRow";
import { QueryResult, Column, AirtableConfig } from "../types";
import ISchema from "../interfaces/ISchema";
import IDatabase from "../interfaces/IDatabase";
import SyncColumnFactory, { SyncColumn } from "./SyncColumn";

export class SyncRow implements ISyncRow {
  private _airtableId: string;
  private _airtableRow: QueryResult;
  private _localId: string;
  private _lookupByLocalId: string;
  private columns: SyncColumn[];
  private row: QueryResult;
  private schema: ISchema;
  private db: IDatabase;

  constructor(row: QueryResult, schema: ISchema, db: IDatabase) {
    this._airtableId = row[schema.local.idColumns.airtable];
    this._localId = row[schema.local.idColumns.local];
    this.columns = this.prepareColumns(schema.columns);
    this.row = row;
    this.schema = schema;
    this.db = db;

    const lookupColumn: Column = schema.columns.find(
      column => column.localColumn === schema.local.idColumns.local
    );

    if (this.schema.airtable.lookupByPrimaryKey) {
      this._lookupByLocalId = lookupColumn ? lookupColumn.airtableColumn : "";
    } else {
      this._lookupByLocalId = "";
    }
  }

  /**
   * Returns the SyncRow's airtable id
   */
  public airtableId(): string {
    return this._airtableId;
  }

  /**
   * Sets the SyncRow's airtable id
   */
  public setAirtableId(id: string): void {
    this._airtableId = id;
    this.row[this.schema.local.idColumns.airtable] = id;
  }

  /**
   * Get the AirtableConfig for the SyncRow's sync
   */
  public airtableConfig(): AirtableConfig {
    const { apiKey, baseId, tableId } = this.schema.airtable;
    return { apiKey, baseId, tableId };
  }

  /**
   * Returns the SyncRow's local id
   */
  public localId(): string {
    return this._localId;
  }

  public lookupByLocalId(): string {
    return this._lookupByLocalId || "";
  }

  private prepareColumns(columns: Column[]): SyncColumn[] {
    return columns.map(c => {
      const column: SyncColumn = SyncColumnFactory(c, this.row[c.localColumn]);
      return column;
    });
  }

  private async prepareAirtableRow(): Promise<void> {
    this._airtableRow = {};
    for (const column of this.columns) {
      if (column.isLinked()) {
        const linkValues: any[] = await this.db.fetchLinkedRecords(
          column.linkedColumnDetails(),
          column.airtableValue()
        );
        column.setValue(linkValues);
      }

      this._airtableRow[column.airtableColumn()] = column.airtableValue();
    }
  }

  public async airtableRow(): Promise<QueryResult> {
    if (!this._airtableRow) {
      await this.prepareAirtableRow();
    }
    return this._airtableRow;
  }
}

export default function(
  row: QueryResult,
  schema: ISchema,
  db: IDatabase
): SyncRow {
  return new SyncRow(row, schema, db);
}
