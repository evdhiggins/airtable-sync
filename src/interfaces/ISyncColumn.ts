export type LinkedColumnDetails = {
  tableName: string;
  lookupColumn: string;
  returnColumn: string;
  multipleRecords: boolean;
};

export interface IColumn {
  airtableColumn(): string;
  airtableValue(): any;
  setValue(value: any): void;
  localColumn(): string;
  isLinked(): boolean;
  linkedColumnDetails(): LinkedColumnDetails;
}
