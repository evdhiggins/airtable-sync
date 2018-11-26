import sqlite3 from "./sqlite3/index";

const databases: any = { sqlite3 };

/**
 * Return the requested database Class
 */
export default (dbName: string) => {
  if (!databases[dbName]) {
    throw new Error(`Database class '${dbName}' not found.`);
  }
  return databases[dbName];
};
