import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db, prisma } from "~/server/db";
import checkUserInTeam from "~/utils/check_usr_in_team";

export const category = createTRPCRouter({
    /**
     * returns the count of categories for the current user
     * */
    getCategoryCount: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.session.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const smt = `SELECT COUNT(*) FROM Category WHERE userId = ?;`;
        type count = { "count(*)": number };
        try {
            const query = await db.execute(smt, [ctx.session.user.id]);
            const rows = query.rows as count[];
            if (!query || !rows[0]) return 0;
            const count = rows[0]["count(*)"] ? rows[0]["count(*)"] : 0;
            return count;
        } catch (e) {
            console.log(e);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error while fetching categories",
            });
        }
    }),
    /**
     * returns a list of categories for the given agent
     * */
    getAgentCategories: protectedProcedure
        .input(
            z.object({
                agentType: z.enum(["user", "team"]),
                agentId: z.string(),
                prisma: z.boolean().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { agentType, agentId } = input;

            if (
                agentType === "team" &&
                !(await checkUserInTeam({
                    teamId: agentId,
                    userId: ctx.session.user.id,
                }))
            ) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }
            try {
                const categories = await prisma.category.findMany({
                    where: {
                        [input.agentType === "user" ? "userId" : "teamId"]:
                            agentId,
                    },
                });
                return categories;
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while fetching categories",
                });
            }
        }),
    /**
    * creates a category for the current agent
    * */
    createCategory: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                color: z.string().regex(/^#[0-9A-F]{6}$/i),
                description: z.string().optional(),
                agentType: z.enum(["user", "team"]),
                agentId: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { agentType, agentId } = input;
            if (
                agentType === "team" &&
                !(await checkUserInTeam({
                    teamId: agentId,
                    userId: ctx.session.user.id,
                }))
            ) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }
            try {
                const newCategory = prisma.category.create({
                    data: {
                        name: input.name,
                        color: input.color,
                        description: input.description,
                        createdBy: {
                            connect: {
                                id: ctx.session.user.id,
                            },
                        },
                        [input.agentType === "user" ? "user" : "team"]:
                            {
                            connect: {
                                id: agentId,
                            }
                        },
                    },
                });
                const agent = agentType === "user" ? prisma.user.update({
                    where: {
                        id: agentId,
                    },
                    data: {
                        categoriesCretedCount: {
                            increment: 1,
                        },
                    },
                }) : prisma.team.update({
                    where: {
                        id: agentId,
                    },
                    data: {
                        categoriesCount: {
                            increment: 1,
                        },
                    },
                });
               const [category] = await prisma.$transaction([newCategory, agent]);
                return category;
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while creating category",
                });
            }
        }
        ),

});
