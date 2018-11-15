exports.config = {
  airtableApiKey: "key",
  airtableBaseId: "baseId",
  airtableTableId: "tableId",
  databaseClass: "sqlite3",

  syncs: [
    {
      localTable: "Table_name",
      columns: [
        {
          airtableColumn: "Column one",
          localColumn: "column_one",
        },
      ],
    },
  ],
};
