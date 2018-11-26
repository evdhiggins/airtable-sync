import SyncRowClass from "src/classes/SyncRow.class";

export default async (sqlite: any, syncRow: SyncRowClass): Promise<void> => {
  const params: any[] = [syncRow.localTable];
};
