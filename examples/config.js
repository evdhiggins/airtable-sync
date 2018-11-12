exports.config = {
  airtableApiKey: "key",
  airtableBaseId: "baseId",
  airtableTableId: "tableId",

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
