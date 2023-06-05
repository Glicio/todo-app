import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db, prisma } from "~/server/db";
import checkUserInTeam from "~/utils/check_usr_in_team";
import type { User } from "@prisma/client";

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
                includeUser: z.boolean().optional(),
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
                    include: {
                        createdBy: input.includeUser,
                        updatedBy: input.includeUser,
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
                name: z.string().min(3).max(50),
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
                        categoriesCreatedCount: {
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
                const userQuery = prisma.user.findUnique({
                    where: {
                        id: ctx.session.user.id,
                    },
                });
               const [category,_, user] = await prisma.$transaction([newCategory, agent, userQuery]);
                return {...category, createdBy: user as User};
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while creating category",
                });
            }
        }
        ),
        /**
        * deletes a category for the current agent
        * */
    deleteCategory: protectedProcedure
        .input(
            z.object({
                categoryId: z.string(),
                agentType: z.enum(["user", "team"]),
                agentId: z.string(),
                deleteTodos: z.boolean().optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {

            if(!ctx.session.user) throw new TRPCError({code: "UNAUTHORIZED"});
            const { agentType, agentId, categoryId } = input;
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
                if(input.deleteTodos){
                    const todos = await prisma.todo.deleteMany({
                        where: {
                            categoryId: categoryId,
                        },
                    });

                    const agent = agentType === "user" ? prisma.user.update({
                        where: {
                            id: agentId,
                        },
                        data: {
                            todosCreatedCount: {
                                decrement: todos.count,
                            },
                            categoriesCreatedCount: {
                                decrement: 1,
                            }
                        },
                    }) : prisma.team.update({
                        where: {
                            id: agentId,
                        },
                        data: {
                            todosCount: {
                                decrement: todos.count,
                            },
                            categoriesCount: {
                                decrement: 1,
                            },
                        },
                    });
                    const category = prisma.category.delete({
                        where: {
                            id: categoryId,
                        },
                    });
                    await prisma.$transaction([agent, category]);
                    return true;
                }
                const agent = agentType === "user" ? prisma.user.update({
                    where: {
                        id: agentId,
                    },
                    data: {
                        categoriesCreatedCount: {
                            decrement: 1,
                        }
                    },
                }) : prisma.team.update({
                    where: {
                        id: agentId,
                    },
                    data: {
                        categoriesCount: {
                            decrement: 1,
                        },
                    },
                });
                const todos = prisma.todo.updateMany({
                    where: {
                        categoryId: categoryId,
                    },
                    data: {
                        categoryId: null,
                    },
                })

                const category = prisma.category.delete({
                    where: {
                        id: categoryId,
                    },
                });
                await prisma.$transaction([agent, todos, category]);
                return true;


            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while deleting category",
                });
            }
        }
        ),
        /**
        * updates a category for the current agent
        * */
    updateCategory: protectedProcedure
        .input(
            z.object({
                categoryId: z.string(),
                agentType: z.enum(["user", "team"]),
                agentId: z.string(),
                name: z.string().min(3).max(50).optional(),
                color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
                description: z.string().optional(),
            }))
            .mutation(async ({ input, ctx }) => {
                if(!ctx.session.user) throw new TRPCError({code: "UNAUTHORIZED"});
                const { agentType, agentId, categoryId } = input;
                if (
                    agentType === "team" &&
                    !(await checkUserInTeam({
                        teamId: agentId,
                        userId: ctx.session.user.id,
                    }))
                ) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
                const category = await prisma.category.findUnique({
                    where: {
                        id: categoryId,
                    },
                });
                if (!category) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Category not found",
                    });
                }
                if(agentType === "user" && category.userId !== ctx.session.user.id){
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You are not authorized to update this category",
                    });
                }
                if(agentType === "team" && category.teamId !== agentId){
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You are not authorized to update this category",
                    });
                }

                    const updatedCategory = await prisma.category.update({
                        where: {
                            id: categoryId,
                        },
                        data: {
                            name: input.name,
                            color: input.color,
                            description: input.description || null,
                            updatedBy: {
                                connect: {
                                    id: ctx.session.user.id,
                                    }
                            },
                            updatedAt: new Date(),
                        },
                    });

                    const userQuery = await prisma.user.findUnique({
                        where: {
                            id: updatedCategory.createdById,
                        },
                    });
                    
                    if(!userQuery) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Error while updating category"});

                    if(updatedCategory.createdById === ctx.session.user.id){
                        return {...updatedCategory, createdBy: userQuery, updatedBy: userQuery};
                    }

                    const updatedByQuery = await prisma.user.findUnique({
                        where: {
                            id: ctx.session.user.id,
                        },
                    });

                    if(!updatedByQuery) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Error while updating category"});
                    
                    return {...updatedCategory, createdBy: userQuery, updatedBy: updatedByQuery};

                    

            }
        ),
        


});
