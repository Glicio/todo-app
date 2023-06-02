import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import type { CategoryResponse, TodoResponse } from "~/utils/db_responses";



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
            if(!query || !rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Todos not found" })
            const count = rows[0]["count(*)"] ? rows[0]["count(*)"] : 0
            return count
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
                excludeDone: z.boolean().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            if (!ctx.session.user)
                throw new TRPCError({ code: "UNAUTHORIZED" });
            const todoSmt = `SELECT * FROM Todo WHERE userId = ? ${
                input.excludeDone ? "AND Todo.done = 1" : ""
            };`;
            const categorySmt = `SELECT * FROM Category WHERE userId = ?;`;
            try {
                const todoQuery = await db.execute(todoSmt, [
                    ctx.session.user.id,
                ]);
                const todos = todoQuery.rows as TodoResponse[];

                const categoryQuery = await db.execute(categorySmt, [
                    ctx.session.user.id,
                ]);
                const categories = categoryQuery.rows as CategoryResponse[];

                const todosWithCategory = todos.map((todo) => {
                    const category = categories.find(
                        (category) => category.id === todo.categoryId
                    );
                    return {
                        ...todo,
                        category: category
                            ? { name: category.name, id: category.id, color: category.color }
                            : { name: undefined, id: undefined },
                    };
                });

                return {
                    todos: todosWithCategory,
                    categories: categories.map((category) => {
                        return { name: category.name, id: category.id, color: category.color };
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
});
