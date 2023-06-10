import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "~/server/db";
import checkUserInTeam from "~/utils/check_usr_in_team";




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
            name: z.string().min(3).max(20),
            color: z.string().regex(/^#[0-9A-F]{6}$/i),
        })).mutation(async ({ input, ctx }) => {

            const user = await prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                },
                select: {
                    teamsCreatedCount: true,
                },
            });
            if (!user) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: 'User not found' });
            }
            if (user.teamsCreatedCount >= 3) {
                throw new TRPCError({ code: "BAD_REQUEST", message: 'You can only create 3 teams' });
            }

            const newTeam = prisma.team.create({
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
            const userUpdate = prisma.user.update({
                where: {
                    id: ctx.session.user.id,
                },
                data: {
                    teamsCreatedCount: {
                        increment: 1,
                    }
                }
            });
            try {
                const [team] = await prisma.$transaction([newTeam, userUpdate]);
                return team;
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while creating team",
                });
            }
        }),
    /**
     * returns the list of users for a given team
     * */
    getTeamUsers: protectedProcedure.input(
        z.object({
            teamId: z.string(),
        })).query(async ({ input, ctx }) => {
            if (!await checkUserInTeam({ userId: ctx.session.user.id, teamId: input.teamId })) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You are not in this team",
                });
            }
            const team = await prisma.team.findUnique({
                where: {
                    id: input.teamId,
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        }
                    },
                },
            });
            if (!team) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Team not found",
                });
            }
            return team.users;
        }
        ),
    /**
     * update team
     * */
    updateTeam: protectedProcedure.input(
        z.object({
            teamId: z.string(),
            name: z.string().min(3).max(20),
            color: z.string().regex(/^#[0-9A-F]{6}$/i),
        })).mutation(async ({ input, ctx }) => {
            if (!await checkUserInTeam({ userId: ctx.session.user.id, teamId: input.teamId })) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You are not in this team",
                });
            }
            const oldTeam = await prisma.team.findUnique({
                where: {
                    id: input.teamId,
                },
                select: {
                    ownerId: true,
                },
            });

            if (!oldTeam || oldTeam.ownerId !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You are not the owner of this team",
                });
            }

            const team = await prisma.team.update({
                where: {
                    id: input.teamId,
                },
                data: {
                    name: input.name,
                    color: input.color,
                },
            });
            if (!team) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Team not found",
                });
            }
            return team;
        }
        ),
});
