import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { db, prisma } from "~/server/db";




export const teams = createTRPCRouter({
    /**
    * returns the list of teams for the current user
    * */
    getUserTeams: protectedProcedure.query(async ({ ctx }) => {
        try {
        const teams = await prisma.team.findMany({
            where: {
                users: {
                    some: {
                        id: ctx.session.user.id,
                    }
                }
            }
        });
        return teams;
        } catch (e) {
            console.log(e);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error while fetching teams",
            });
        }
    }),
    /**
    * creates a team for the current user
    * */
    createTeam: protectedProcedure.input(
        z.object({
            name: z.string(),
            color: z.string().regex(/^#[0-9A-F]{6}$/i),
        })).mutation(async ({input, ctx}) => {
        
            const userTeamsCountSmt = `SELECT count(*) FROM Team WHERE ownerId = ?`;
            const userTeamsCount = await db.execute(userTeamsCountSmt, [ctx.session.user.id]);
            if(!userTeamsCount.rows[0]) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Error getting user teams count',
                });
            }
            if (userTeamsCount.rows[0]['count(*)' as keyof typeof userTeamsCount.rows[0]] >= 3) {
                throw new TRPCError({code: "BAD_REQUEST", message: 'You can only create 3 teams'});
            }

            const team = await prisma.team.create({
                data: {
                    name: input.name,
                    color: input.color,
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
