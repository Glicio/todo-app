import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db, prisma } from "~/server/db";
import type { CategoryResponse, TodoResponse } from "~/utils/db_responses";
import getCountFromDBQuery from "~/utils/getCountFromDBQuery";

export const todos = createTRPCRouter({
    /**
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
                excludeDone: z.boolean().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { agentType, agentId } = input;

            if (agentType === "team") {
                const team = await prisma.team.findMany({
                    where: {
                        id: agentId,
                        users: {
                            some: {
                                id: ctx.session.user.id,
                            },
                        },
                    },
                });
                if (!team) throw new TRPCError({ code: "UNAUTHORIZED" });
            } else {

                if (!ctx.session.user)
                    throw new TRPCError({ code: "UNAUTHORIZED" });

                if (ctx.session.user.id !== agentId)
                    throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            if (!ctx.session.user) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            const column = agentType === "user" ? "userId" : "teamId";

            const todoSmt = `SELECT * FROM Todo WHERE ${column} = ? ${
                input.excludeDone ? "AND Todo.done = 1" : ""
            };`;
            const categorySmt = `SELECT * FROM Category WHERE ${column} = ?;`;

            try {
                const todoQuery = await db.execute(todoSmt, [
                    agentId,
                ]);
                const todos = todoQuery.rows as TodoResponse[];

                const categoryQuery = await db.execute(categorySmt, [
                    agentId,
                ]);
                const categories = categoryQuery.rows as CategoryResponse[];

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
                            : { name: undefined, id: undefined },
                    };
                });

                return {
                    todos: todosWithCategory,
                    categories: categories.map((category) => {
                        return {
                            name: category.name,
                            id: category.id,
                            color: category.color,
                        };
                    }),
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
                dueDate: z.string().optional(),
                description: z.string().optional(),
                categoryId: z.string().optional(),
                userId: z.string().optional(),
                teamId: z.string().optional(),
                assignedUserId: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const {
                title,
                dueDate,
                description,
                categoryId,
                userId,
                teamId,
                assignedUserId,
            } = input;
            if (!ctx.session.user)
                throw new TRPCError({ code: "UNAUTHORIZED" });
            if (
                (input.userId && input.teamId) ||
                (!input.userId && !input.teamId)
            )
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Either userId or teamId must be provided",
                });

            if (input.userId) {
                const counterSMT = `SELECT COUNT(*) FROM Todo WHERE userId = ?;`;
                const countUserTodos = await db.execute(counterSMT, [
                    ctx.session.user.id,
                ]);
                if (!countUserTodos || !countUserTodos.rows[0])
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Error while fetching todos",
                    });
                const count = getCountFromDBQuery(countUserTodos.rows);
                if (count >= 50) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "User has too many todos",
                    });
                }
            }
            if (input.teamId) {
                const counterSMT = `SELECT COUNT(*) FROM Todo WHERE teamId = ?;`;
                const countUserTodos = await db.execute(counterSMT, [teamId]);
                if (!countUserTodos || !countUserTodos.rows[0])
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Error while fetching todos",
                    });
                const count = getCountFromDBQuery(countUserTodos.rows);
                if (count >= 50) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "User has too many todos",
                    });
                }
            }

            try {
                const todo = await prisma.todo.create({
                    data: {
                        title: title,
                        dueDate: dueDate,
                        description: description,
                        done: false,
                        createdBy: {
                            connect: {
                                id: ctx.session.user.id,
                            },
                        },
                        category: categoryId
                            ? { connect: { id: categoryId } }
                            : undefined,
                        user: userId
                            ? { connect: { id: ctx.session.user.id } }
                            : undefined,
                        team: teamId ? { connect: { id: teamId } } : undefined,
                        assignedTo: assignedUserId
                            ? { connect: { id: assignedUserId } }
                            : undefined,
                    },
                });
                return todo;
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while creating todo",
                });
            }
        }),
});
