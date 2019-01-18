import { Column } from "../types";
import { IColumn, LinkedColumnDetails } from "../interfaces/ISyncColumn";
import assertionTester from "../assertionTester";
import assert = require("assert");

export class SyncColumn implements IColumn {
  private _localColumn: string;
  private _airtableColumn: string;
  private _value: any;
  private _linkedColumn?: boolean;
  private _linkedColumnDetails?: LinkedColumnDetails;

  private _prepare?: (value: any) => any;

  constructor(column: Column, value: any) {
    // verify base-level column values
    type ColumnBaseKeys =
      | "localColumn"
      | "airtableColumn"
      | "linkedColumn"
      | "prepare";
    ["localColumn", "airtableColumn", "linkedColumn", "prepare"].forEach(
      (key: ColumnBaseKeys) => assertionTester("column", key, column[key])
    );
    this._localColumn = column.localColumn;
    this._airtableColumn = column.airtableColumn;
    this._prepare = column.prepare;
    this._linkedColumn = column.linkedColumn;

    // verify `value` input
    assert(
      typeof value !== "undefined",
      `Column ( ${column.localColumn} / ${
        column.airtableColumn
      } )value cannot be undefined`
    );
    this._value = value;

    if (column.linkedColumn) {
      // verify linkedColumnDetails
      type LinkedColumnKeys =
        | "linkedTableName"
        | "linkedLookupColumn"
        | "linkedReturnColumn"
        | "multipleRecords";
      [
        "linkedTableName",
        "linkedLookupColumn",
        "linkedReturnColumn",
        "multipleRecords"
      ].forEach((key: LinkedColumnKeys) =>
        assertionTester("column", key, column[key])
      );
    }
    this._linkedColumnDetails = {
      tableName: column.linkedTableName || "",
      lookupColumn: column.linkedLookupColumn || "",
      returnColumn: column.linkedReturnColumn || "",
      multipleRecords: column.multipleRecords === true
    };
  }

  public airtableColumn(): string {
    return this._airtableColumn;
  }

  public airtableValue(): any {
    if (typeof this._prepare === "function") {
      try {
        return this._prepare(this._value);
      } catch (err) {
        console.warn(
          `Prepare function failed in column [ ${this._localColumn} / ${
            this._airtableColumn
          } ]:`
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
