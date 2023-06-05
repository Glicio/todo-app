import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db, prisma } from "~/server/db";
import type { CategoryResponse, TodoResponse } from "~/utils/db_responses";
import checkUserInTeam from "~/utils/check_usr_in_team";
import SimpleUser from "~/utils/simple_user";

export const todos = createTRPCRouter({
    /**
     * needs to be updated to the new agent mode
     * returns the count of todos for the current user
     * */
    getTodoCount: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.session.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const smt = `SELECT COUNT(*) FROM Todo WHERE userId = ?;`;
        type count = { "count(*)": number };
        try {
            const query = await db.execute(smt, [ctx.session.user.id]);
            const rows = query.rows as count[];
            if (!query || !rows[0])
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Todos not found",
                });
            const count = rows[0]["count(*)"] ? rows[0]["count(*)"] : 0;
            return count;
        } catch (e) {
            console.log(e);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error while fetching todos",
            });
        }
    }),
    /**
     *
     * return a list of users todos containing the category name and id and a list of categories
     * @param input.excludeDone - if true, only return todos that are not done
     **/
    getUserTodos: protectedProcedure
        .input(
            z.object({
                agentType: z.enum(["user", "team"]),
                agentId: z.string(),
                done: z.boolean().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { agentType, agentId } = input;
            if (!ctx.session.user) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            if (agentType === "team") {
                if(!await checkUserInTeam({userId: ctx.session.user.id, teamId: agentId})) throw new TRPCError({code: "UNAUTHORIZED"})
            } else {
                if (ctx.session.user.id !== agentId)
                    throw new TRPCError({ code: "UNAUTHORIZED" });
            }



            try {
                
                const todosQuery = prisma.todo.findMany({
                    where: {
                        [agentType === "team" ? "teamId" : "userId"]:  agentId,
                        done: input.done ? input.done : undefined,
                    },
                    include: {
                        createdBy: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                        updatedBy: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                        assignedTo: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                    }
                })
                const categoriesQuery = prisma.category.findMany({
                    where: agentType === "team" ? { teamId: agentId } : { userId: agentId },
                    select: {
                        name: true,
                        id: true,
                        color: true,
                    },
                })
                const [todos, categories] = await prisma.$transaction([
                    todosQuery,
                    categoriesQuery,
                ]);
                const todosWithCategory = todos.map((todo) => {
                    const category = categories.find(
                        (category) => category.id === todo.categoryId
                    );
                    return {
                        ...todo,
                        category: category
                            ? {
                                  name: category.name,
                                  id: category.id,
                                  color: category.color,
                              }
                            : undefined,
                    };
                });
                return {
                    todos: todosWithCategory,
                    categories: categories,
                };
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while fetching todos",
                });
            }
        }),
    /**
     * create a new todo
     * @param input.title - the name of the todo
     * @param input.categoryId - the id of the category the todo belongs to
     * @param input.done - if true, the todo is marked as done
     * @param input.dueDate - the date the todo is due
     * @param input.description - the description of the todo
     **/
    createTodo: protectedProcedure
        .input(
            z.object({
                title: z.string(),
                dueDate: z.date().optional(),
                description: z.string().optional(),
                categoryId: z.string().optional(),
                agentType: z.enum(["user", "team"]),
                agentId: z.string(),
                assignedUserId: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const {
                title,
                dueDate,
                description,
                categoryId,
                agentType,
                agentId,
                assignedUserId,
            } = input;
            if (!ctx.session.user)
                throw new TRPCError({ code: "UNAUTHORIZED" });

            if (agentType === "team") {
                if (
                    !(await checkUserInTeam({
                        userId: ctx.session.user.id,
                        teamId: agentId,
                    }))
                ) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
            }

            if (agentType === "user") {
                const user = await prisma.user.findUnique({
                    where: {
                        id: ctx.session.user.id,
                    },
                    select: {
                        todosCreatedCount: true,
                    },
                });
                if (!user)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "User not found",
                    });
                if (user.todosCreatedCount >= 50) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "You can only create 50 todos",
                    });
                }
            }
            if (agentType === "team") {
                const team = await prisma.team.findUnique({
                    where: {
                        id: agentId,
                    },
                    select: {
                        todosCount: true,
                    },
                });
                if (!team)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Team not found",
                    });
                if (team.todosCount >= 50) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "This team can only create 50 todos",
                    });
                }
            }

            try {
                const newTodo = prisma.todo.create({
                    data: {
                        title: title,
                        dueDate: dueDate,
                        description: description,
                        createdBy: {
                            connect: {
                                id: ctx.session.user.id,
                            },
                        },
                        category: categoryId
                            ? { connect: { id: categoryId } }
                            : undefined,
                        user:
                            agentType === "user"
                                ? { connect: { id: ctx.session.user.id } }
                                : undefined,
                        team:
                            agentType === "team"
                                ? { connect: { id: agentId } }
                                : undefined,
                        assignedTo: assignedUserId
                            ? { connect: { id: assignedUserId } }
                            : undefined,
                    },
                    include: {
                        createdBy: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                        updatedBy: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                        assignedTo: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                        category: {
                            select: {
                                name: true,
                                id: true,
                                color: true,
                            },
                        },
                    },

                });
                const agent =
                    agentType === "user"
                        ? prisma.user.update({
                              where: {
                                  id: ctx.session.user.id,
                              },
                              data: {
                                  todosCreatedCount: {
                                      increment: 1,
                                  },
                              },
                          })
                        : prisma.team.update({
                              where: {
                                  id: agentId,
                              },
                              data: {
                                  todosCount: {
                                      increment: 1,
                                  },
                              },
                          });
                const [todo, owner] = await prisma.$transaction([newTodo, agent]);
                if(agentType === "user") {
                    return {...todo, createdBy: {name: owner.name, id: owner.id}}
                }
                const createdBy = await prisma.user.findUnique({
                    where: {
                        id: todo.createdById
                    },
                    select: {
                        name: true,
                        id: true
                    }
                })
                if(!createdBy) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Error while creating todo",
                    });
                }
                return {...todo, createdBy: createdBy as SimpleUser}
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while creating todo",
                });
            }
        }),
    /**
     * delete a todo
     * */
    deleteTodo: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                agentType: z.enum(["user", "team"]),
                agentId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user)
                throw new TRPCError({ code: "UNAUTHORIZED" });
            if (input.agentType === "team") {
                if (
                    !(await checkUserInTeam({
                        userId: ctx.session.user.id,
                        teamId: input.agentId,
                    }))
                ) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
            }
            if (input.agentType === "user") {
                if (ctx.session.user.id !== input.agentId) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
            }
            try {
                const todoToDelete = prisma.todo.delete({
                    where: { id: input.id },
                });
                const user =
                    input.agentType === "user"
                        ? prisma.user.update({
                              where: { id: ctx.session.user.id },
                              data: {
                                  todosCreatedCount: {
                                      decrement: 1,
                                  },
                              },
                          })
                        : prisma.team.update({
                              where: { id: input.agentId },
                              data: {
                                  todosCount: {
                                      decrement: 1,
                                  },
                              },
                          });

                await prisma.$transaction([todoToDelete, user]);
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while deleting todo",
                });
            }
        }),
    /**
     * mark a todo as done
     * */
    markAsDone: protectedProcedure
        .input(
            z.object({
                todoId: z.string(),
                agentType: z.enum(["user", "team"]),
                agentId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user)
                throw new TRPCError({ code: "UNAUTHORIZED" });
            if (input.agentType === "team") {
                if (
                    !(await checkUserInTeam({
                        userId: ctx.session.user.id,
                        teamId: input.agentId,
                    }))
                ) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
            }
            if (input.agentType === "user") {
                if (ctx.session.user.id !== input.agentId) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
            }
            try {
                const todo = await prisma.todo.update({
                    where: { id: input.todoId },
                    data: {
                        done: true,
                        doneAt: new Date(),
                        doneBy: {
                            connect: {
                                id: ctx.session.user.id,
                            },
                        },
                    },
                });
                return todo;
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while marking todo as done",
                });
            }
        }),
    /**
     * undo a todo
     * */
    undoTodo: protectedProcedure
        .input(
            z.object({
                todoId: z.string(),
                agentType: z.enum(["user", "team"]),
                agentId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user)
                throw new TRPCError({ code: "UNAUTHORIZED" });
            if (input.agentType === "team") {
                if (
                    !(await checkUserInTeam({
                        userId: ctx.session.user.id,
                        teamId: input.agentId,
                    }))
                ) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
            }
            if (input.agentType === "user") {
                if (ctx.session.user.id !== input.agentId) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
            }
            try {
                const todo = await prisma.todo.update({
                    where: { id: input.todoId },
                    data: {
                        done: false,
                        doneAt: null,
                        doneBy: {
                            disconnect: true,
                        },
                    },
                });
                return todo;
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while undoing todo",
                });
            }
        }),
    /**
     * update a todo
     * */
    updateTodo: protectedProcedure
        .input(
            z.object({
                todoId: z.string(),
                agentType: z.enum(["user", "team"]),
                agentId: z.string(),
                title: z.string(),
                dueDate: z.date().optional(),
                description: z.string(),
                categoryId: z.string().nullable(),
                assignedUserId: z.string().nullable(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user)
                throw new TRPCError({ code: "UNAUTHORIZED" });
            if (input.agentType === "team") {
                if (
                    !(await checkUserInTeam({
                        userId: ctx.session.user.id,
                        teamId: input.agentId,
                    }))
                ) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
            }
            if (input.agentType === "user") {
                if (ctx.session.user.id !== input.agentId) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
            }
            const todo = await prisma.todo.findUnique({
                where: { id: input.todoId },
            });
            if (!todo) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Todo not found",
                });
            }

            if(todo.done) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You can't edit a todo that is already done",
                });
            }

            if(input.agentType === "team" && todo.teamId !== input.agentId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You can't edit a todo that is not in your team",
                });
            }
            if(input.agentType === "user" && todo.userId !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You can't edit a todo that is not yours",
                });
            }

            try {
                const todo = await prisma.todo.update({
                    where: { id: input.todoId },
                    data: {
                        title: input.title,
                        dueDate: input.dueDate || null,
                        description: input.description || null,
                        updatedAt: new Date(),
                        updatedBy: {
                            connect: {
                                id: ctx.session.user.id,
                            },
                        },
                        category: input.categoryId
                            ? {
                                  connect: {
                                      id: input.categoryId,
                                  },
                              }
                            : { disconnect: true },

                        assignedTo: input.assignedUserId
                            ? {
                                connect: {
                                    id: input.assignedUserId,
                                },
                            }
                            : { disconnect: true },
                    },
                });
                const user = await prisma.user.findUnique({
                    where: { id: ctx.session.user.id },
                });

                if(!user) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Error while updating todo",
                    });
                }

                if(user.id === todo.createdById) {
                    return {...todo,createdBy: user, updatedBy: user};
                }

                const createdBy = await prisma.user.findUnique({
                    where: { id: todo.createdById },
                });

                if(!createdBy) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Error while updating todo",
                    });
                }

                return {...todo, updatedBy: user, createdBy};

            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while updating todo",
                });
            }
        }),
});
