import sqlite3 from "./sqlite3/index";
import IDatabase from "../interfaces/IDatabase";

const databases: any = { sqlite3 };

/**
 * Return the requested database Class
 */
export default (dbName: string, dbOptions: any): IDatabase => {
  if (!databases[dbName]) {
    throw new Error(`Database class '${dbName}' not found.`);
  }
  return new databases[dbName](dbOptions);
};
