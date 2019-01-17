import { Column } from "../types";
import { IColumn, LinkedColumnDetails } from "../interfaces/ISyncColumn";

export class SyncColumn implements IColumn {
  private _localColumn: string;
  private _airtableColumn: string;
  private _value: any;
  private _linkedColumn?: boolean;
  private _linkedColumnDetails?: LinkedColumnDetails;

  private prepare?: (value: any) => any;

  constructor(column: Column, value: any) {
    this._localColumn = column.localColumn;
    this._airtableColumn = column.airtableColumn;
    this._linkedColumn = column.linkedColumn;
    this._value = value;

    this._linkedColumnDetails = {
      tableName: column.linkedTableName,
      lookupColumn: column.linkedLookupColumn,
      returnColumn: column.linkedReturnColumn,
      multipleRecords: column.multipleRecords,
    };
  }

  public airtableColumn(): string {
    return this._airtableColumn;
  }

  public airtableValue(): any {
    if (typeof this.prepare === "function") {
      try {
        return this.prepare(this._value);
      } catch (err) {
        console.warn(
          `Prepare function failed in column [ ${this._localColumn} / ${
            this._airtableColumn
          } ]:`,
        );
        console.warn(err.message);
      }
    }
    return this._value;
  }

  public setValue(value: any): void {
    this._value = value;
  }

  public isLinked(): boolean {
    return this._linkedColumn === true;
  }

  public linkedColumnDetails(): LinkedColumnDetails {
    return this._linkedColumnDetails;
  }
}

export default function(column: Column, value: any): SyncColumn {
  return new SyncColumn(column, value);
}
