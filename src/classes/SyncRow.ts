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
  private _columns: SyncColumn[];
  private _row: QueryResult;
  private _schema: ISchema;
  private _db: IDatabase;

  constructor(row: QueryResult, schema: ISchema, db: IDatabase) {
    this._airtableId = row[schema.local.idColumns.airtable];
    this._localId = row[schema.local.idColumns.local];
    this._row = row;
    this._schema = schema;
    this._db = db;
    this._columns = this.prepareColumns(schema.columns);

    const lookupColumn: Column = schema.columns.find(
      column => column.localColumn === schema.local.idColumns.local
    );

    if (this._schema.airtable.lookupByPrimaryKey) {
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
    this._row[this._schema.local.idColumns.airtable] = id;
  }

  /**
   * Get the AirtableConfig for the SyncRow's sync
   */
  public airtableConfig(): AirtableConfig {
    const { apiKey, baseId, tableId } = this._schema.airtable;
    return { apiKey, baseId, tableId };
  }

  /**
   * Returns the SyncRow's local id
   */
  public localId(): string {
    return this._localId;
  }

  public localRow(): QueryResult {
    return this._columns.reduce(
      (acc, column) => {
        acc[column.localColumn()] = this._row[column.localColumn()];
        return acc;
      },
      {} as QueryResult
    );
  }

  public lookupByLocalId(): string {
    return this._lookupByLocalId || "";
  }

  private prepareColumns(columns: Column[]): SyncColumn[] {
    return columns.map(c => {
      const column: SyncColumn = SyncColumnFactory(c, this._row[c.localColumn]);
      return column;
    });
  }

  private async prepareAirtableRow(): Promise<void> {
    this._airtableRow = {};
    for (const column of this._columns) {
      if (column.isLinked()) {
        const linkValues: any[] = await this._db.fetchLinkedRecords(
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
