import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import type { CategoryResponse } from "~/utils/db_responses";
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
            const column = agentType === "user" ? "userId" : "teamId";
            const smt = `SELECT * FROM Category WHERE ${column} = ?;`;
            try {
                const query = await db.execute(smt, [ctx.session.user.id]);
                const rows = query.rows as CategoryResponse[];
                if (!query || !rows[0]) return [];
                return rows;
            } catch (e) {
                console.log(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error while fetching categories",
                });
            }
        }),
});
