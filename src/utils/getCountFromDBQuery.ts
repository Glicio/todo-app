
export default function getCountFromDBQuery(rows: Record<string, any>[]) {
    if (!rows || !rows[0]) {
    throw new Error("No rows returned from query");
    }
  return rows[0]["count(*)" as keyof typeof rows[0]] as number;
}

