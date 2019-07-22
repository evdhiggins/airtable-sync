const AirtableSync = require("@evdhiggins/airtable-sync");

/**
 * For airtable-sync v0.2.4
 */

const airtableConfig = {
  apiKey: "keyxxxxxxxxxxxxxx",
  baseId: "appxxxxxxxxxxxxxx",
};

const databaseConfig = {
  name: "postgresql",
  options: {
    databaseUrl: "postgres://USER:PASS@HOST:PORT/DB",
  },
};

const itemSync = {
  name: "Items",
  airtable: {
    tableId: "tblxxxxxxxxxxxxxx",
  },
  local: {
    tableName: "items",
    syncFlag: {
      columnName: "to_sync",
      true: "T",
      false: "F",
    },
    idColumns: {
      local: "id",
      airtable: "record_id",
    },
  },
  columns: [
    {
      localColumn: "id",
      airtableColumn: "Item ID",
    },
    {
      localColumn: "name",
      airtableColumn: "Item Name",
    },
    {
      localColumn: "price",
      airtableColumn: "Price",
    },
  ],
};


const salesSync = {
  name: "Sales",
  airtable: {
    tableId: "tblxxxxxxxxxxxxxx",
    lookupByPrimaryKey: true,
  },
  local: {
    tableName: "sales",
    syncFlag: {
      columnName: "to_sync",
      true: true,
      false: false,
    },
    idColumns: {
      airtable: "record_id",
      local: "id",
    },
  },
  columns: [
    {
      localColumn: "id",
      airtableColumn: "ID",
    },
    {
      localColumn: "total_sales_value",
      airtableColumn: "Total Sales",
    },
    {
      localColumn: "total_sales_qty",
      airtableColumn: "Total Qty Sold",
    },
  ],
};

(async () => {
  const sync = AirtableSync({
    airtable: airtableConfig,
    database: databaseConfig,
  });

  sync.addSync(itemSync);
  sync.addSync(salesSync);

  const results = await sync.run();
  console.log(results);
})();
