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
    /**
     * creates a invitation for a given team
     * */

    createInvitation: protectedProcedure.input(
        z.object({
            teamId: z.string(),
            email: z.string().email().optional(),
        })
    ).mutation(async ({ input, ctx }) => {
        if (!await checkUserInTeam({ userId: ctx.session.user.id, teamId: input.teamId })) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "You are not in this team",
            });
        }
        const team = await prisma.team.findUnique({
            where: {
                id: input.teamId
            },
            select: {
                ownerId: true,
            },
        });

        if (!team || team.ownerId !== ctx.session.user.id) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "You don't have permission to invite users to this team",
            });
        }

        if (input.email) {
            const teamUsers = await prisma.team.count({
                where: {
                    id: input.teamId,
                    users: {
                        some: {
                            email: input.email,
                        }
                    }
                },
            });
            if (teamUsers > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "User already in team",
                });
            }
        } else {
            const invitations = await prisma.teamInvitation.findMany({
                where: {
                    teamId: input.teamId,
                    email: null,
                    accepted: false,
                },
            });
            if (invitations.length > 0) {
                if(!invitations[0]?.id) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Error while creating invitation",
                    });
                }
                return {
                    invitationId: invitations[0].id,
                    invitationLink: `/join-team/${invitations[0].id}`,
                }
            }
        }


        const invitation = await prisma.teamInvitation.create({
            data: {
                team: {
                    connect: {
                        id: input.teamId,
                    }
                },
                invitedBy: {
                    connect: {
                        id: ctx.session.user.id,
                    }
                },
                //expires in 24 hours
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
                email: input.email || null,
            },
        });
        if (input.email) {
            console.log("sending email");
            return "email sent"
        }

        return {
            invitationId: invitation.id,
            invitationLink: `/join-team/${invitation.id}`,
        };
    }
    ),
    /**
     * returns the list of invitations for a given team
     * */
    getTeamInvitations: protectedProcedure.input(
        z.object({
            teamId: z.string(),
        })).query(async ({ input, ctx }) => {
            if (!await checkUserInTeam({ userId: ctx.session.user.id, teamId: input.teamId })) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You are not in this team",
                });
            }
            const invitations = await prisma.teamInvitation.findMany({
                where: {
                    teamId: input.teamId,
                },
            });
            return invitations;
        }),
    /**
     * deletes a invitation for a given team
     * */
    deleteInvitation: protectedProcedure.input(
        z.object({
            invitationId: z.string(),
        })).mutation(async ({ input, ctx }) => {
            const invitation = await prisma.teamInvitation.findUnique({
                where: {
                    id: input.invitationId,
                },
                select: {
                    team: {
                        select: {
                            ownerId: true,
                        }
                    }
                }
            });
            if (!invitation) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invitation not found",
                });
            }
            if (invitation.team.ownerId !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You don't have permission to delete this invitation",
                });
            }
            const deletedInvitation = await prisma.teamInvitation.delete({
                where: {
                    id: input.invitationId,
                },
            });
            return deletedInvitation;
        }),
    /**
     * add a user to a team through a invitation
     * */
    acceptInvitation: protectedProcedure.input(
        z.object({
            invitationId: z.string(),
        })).mutation(async ({ input, ctx }) => {
            const invitation = await prisma.teamInvitation.findUnique({
                where: {
                    id: input.invitationId,
                },
                select: {
                    team: {
                        select: {
                            id: true,
                            ownerId: true,
                        }
                    },
                    email: true,

                }
            });
            if (!invitation) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invitation not found",
                });
            }
            if (invitation.email && (!ctx.session.user.email || invitation.email !== ctx.session.user.email)) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You don't have permission to accept this invitation",
                });
            }
            const team = await prisma.team.findUnique({
                where: {
                    id: invitation.team.id,
                },
                include: {
                    users: {
                        select: {
                            id: true,
                        }
                    }
                }
            });
            if (!team) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Team not found",
                });
            }
            const userInTeam = team.users.find((user) => user.id === ctx.session.user.id);
            if (userInTeam) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You are already in this team",
                });
            }
            const updatedTeam = await prisma.team.update({
                where: {
                    id: invitation.team.id,
                },
                data: {
                    users: {
                        connect: {
                            id: ctx.session.user.id,
                        }
                    }
                },
            });
            if (!updatedTeam) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Team not found",
                });
            }
            await prisma.teamInvitation.delete({
                where: {
                    id: input.invitationId,
                },
            });
            return updatedTeam;
        }),
});
