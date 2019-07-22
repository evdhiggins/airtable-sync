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

const eventsSync = {
  name: "Events",
  airtable: {
    tableId: "tblxxxxxxxxxxxxxx",
    lookupByPrimaryKey: true,
  },
  local: {
    tableName: "events",
    syncFlag: {
      columnName: "to_sync",
      true: "T",
      false: "F",
    },
    idColumns: {
      local: "event_id",
      airtable: "record_id",
    },
  },
  columns: [
    {
      localColumn: "event_id",
      airtableColumn: "Event ID",
    },
    {
      localColumn: "event_deleted",
      airtableColumn: "Deleted",
    },
    {
      localColumn: "event_id",
      airtableColumn: "Event",
      linkedColumn: true,
      linkedTableName: "events",
      linkedLookupColumn: "event_id",
      linkedReturnColumn: "record_id",
      multipleRecords: false,
    },
  ],
  filters: [
    {
      type: "column",
      localColumn: "event_deleted",
      match: "T",
      actions: [
        (localRow) => {
          // print row from synced database
          console.log(localRow);
        },
        "removeFromAirtable"
      ],
      removeFromAirtableCallback: (airtableRow) => {
        // print deleted row from airtable
        console.log(airtableRow);
      }
    }
  ]
};


(async () => {
  const sync = new AirtableSync({
    airtable: airtableConfig,
    database: databaseConfig,
  });

  sync.addSync(eventsSync);

  const results = await sync.run();
  console.log(results);
})();
