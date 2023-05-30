import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { CategoryResponse } from "~/utils/db_responses";



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
            if(!query || !rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Categories not found" })
            const count = rows[0]["count(*)"] ? rows[0]["count(*)"] : 0
            return count
        } catch (e) {
            console.log(e);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error while fetching categories",
            });
        }
    }),
    /**
    * returns a list of categories for the current user
    * */
    getUserCategories: protectedProcedure
        .query(async ({ ctx }) => {
            const smt = `SELECT * FROM Category WHERE userId = ?;`;
            try {
                const query = await db.execute(smt, [ctx.session.user.id]);
                const rows = query.rows as CategoryResponse[];
                if (!query || !rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Categories not found" })
                return rows
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while fetching categories",
                });
            }
        })
    });

