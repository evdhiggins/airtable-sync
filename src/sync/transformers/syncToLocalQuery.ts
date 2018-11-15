import { ISync, ILocalQuery } from "src/types";

export default (sync: ISync): ILocalQuery => {
  const localQuery: ILocalQuery = {
    tableName: sync.localTable,
    columns: sync.columns.map((column) => column.localColumn),
  };
  return localQuery;
};
