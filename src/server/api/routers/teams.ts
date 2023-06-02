import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { db, prisma } from "~/server/db";




export const teams = createTRPCRouter({
    
    createTeam: protectedProcedure.input(
        z.object({
            name: z.string(),
        })).mutation(async ({input, ctx}) => {
        
            const userTeamsCountSmt = `SELECT COUNT(*) FROM teams WHERE owner_id = ?`;
            const userTeamsCount = await db.execute(userTeamsCountSmt, [ctx.session.user.id]);
            if(!userTeamsCount.rows[0]) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Error getting user teams count',
                });
            }
            if (userTeamsCount.rows[0]['COUNT(*)' as keyof typeof userTeamsCount.rows[0]] >= 3) {
                throw new Error('You can only create 3 teams');
            }

            const team = await prisma.team.create({
                data: {
                    name: input.name,
                    users: {
                        connect: {
                            id: ctx.session.user.id,
                        }
                    },
                    owner: {
                        connect: {
                            id: ctx.session.user.id,
                        }
                    }
                }
            });
            return team;
        }),


});
