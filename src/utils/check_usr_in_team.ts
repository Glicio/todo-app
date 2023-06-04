import { db, prisma } from "../server/db";
import getCountFromDBQuery from "./getCountFromDBQuery";

export default async function checkUserInTeam({ teamId, userId }: { teamId: string, userId: string }) {
    const smt = "SELECT count(*) FROM _TeamToUser WHERE A = ? AND B = ?"
    const res = await db.execute(smt, [teamId, userId])
    const count = getCountFromDBQuery(res.rows)
//   const team = await prisma.team.findMany({
//       where: {    
//           id: teamId,
//           users: {
//               some: {
//                   id: userId,
//               },
//           },
//       },
//   });
    if (count !== 1) return false
    return true
}
