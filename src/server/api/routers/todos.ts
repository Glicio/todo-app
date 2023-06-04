import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db, prisma } from "~/server/db";
import type { CategoryResponse, TodoResponse } from "~/utils/db_responses";
import getCountFromDBQuery from "~/utils/getCountFromDBQuery";
import checkUserInTeam from "~/utils/check_usr_in_team";

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

            const todoSmt = `SELECT * FROM Todo WHERE ${column} = ? AND Todo.done = ${input.done ? "1" :"0"};`;
            const categorySmt = `SELECT * FROM Category WHERE ${column} = ?;`;

            try {
                const todoQuery = await db.execute(todoSmt, [agentId]);
                const todos = todoQuery.rows as TodoResponse[];

                const categoryQuery = await db.execute(categorySmt, [agentId]);
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
            if (agentType === "team") {
                const counterSMT = `SELECT COUNT(*) FROM Todo WHERE teamId = ?;`;
                const countUserTodos = await db.execute(counterSMT, [
                    input.agentId,
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

            try {
                const todo = await prisma.todo.create({
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
    /**
    * delete a todo
    * */
    deleteTodo: protectedProcedure
        .input(z.object({
            id: z.string(),
            agentType: z.enum(["user", "team"]),
            agentId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user) throw new TRPCError({ code: "UNAUTHORIZED" });
            if (input.agentType === "team") {
                if (!(await checkUserInTeam({ userId: ctx.session.user.id, teamId: input.agentId }))) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
            }
            if (input.agentType === "user") {
                if (ctx.session.user.id !== input.agentId) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }
            }
            try {
                const todo = await prisma.todo.delete({
                    where: { id: input.id }
                });
                return todo;
            } catch (e) {
                console.log(e);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error while deleting todo" });

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
            if (!ctx.session.user) throw new TRPCError({ code: "UNAUTHORIZED" });
            if (input.agentType === "team") {
                if (!(await checkUserInTeam({ userId: ctx.session.user.id, teamId: input.agentId }))) {
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
                            }
                        }
                    }
                });
                return todo;
            } catch (e) {
                console.log(e);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error while marking todo as done" });
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
            if (!ctx.session.user) throw new TRPCError({ code: "UNAUTHORIZED" });
            if (input.agentType === "team") {
                if (!(await checkUserInTeam({ userId: ctx.session.user.id, teamId: input.agentId }))) {
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
                            disconnect: true
                        }
                    }
                });
                return todo;
            } catch (e) {
                console.log(e);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error while undoing todo" });
            }
        }),

});
