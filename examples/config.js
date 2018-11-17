exports.config = {
  airtableApiKey: "key",
  airtableBaseId: "baseId",
  airtableTableId: "tableId",
  databaseClass: "sqlite3",
  databaseOptions: {
    path: "./path/from/root/to/database.sql"
  },

  localIdColumns: {
    recordId: "record_id",
    primaryKey: "id"
  },

  syncFlag: {
    columnName: "to_sync",
    true: "T",
    false: "F"
  },

  syncs: [
    {
      localTable: "Table_name",
      columns: [
        {
          airtableColumn: "Column one",
          localColumn: "column_one"
        }
      ]
    }
  ]
};
