import { prisma } from "../server/db";

export default async function checkUserInTeam({ teamId, userId }: { teamId: string, userId: string }) {
    const team = await prisma.team.findMany({
        where: {    
            id: teamId,
            users: {
                some: {
                    id: userId,
                },
            },
        },
    });
    if (!team) return false
    return true
}
