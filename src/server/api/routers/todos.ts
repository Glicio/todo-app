import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

interface TodoResponse {
    id: string;
    title: string;
    description: string;
    userId: string;
    categoryId: string;
    createdAt: string;
    done: string;
    dueDate: string;
    updatedAt: string;
}

interface CategoryResponse {
    id: string;
    name: string;
    description: string;
    userId: string;
    color: string;
}

export const todos = createTRPCRouter({
    /**
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
