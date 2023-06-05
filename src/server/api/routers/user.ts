import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db, prisma } from "~/server/db";

export const user = createTRPCRouter({
    /**
     * sync the user's data with the database
     * */
    syncUser: protectedProcedure.mutation(async ({ ctx }) => {
        if (!ctx.session.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const teamsCount = prisma.team.count({
            where: {
                users: {
                    some: {
                        id: ctx.session.user.id,
                    },
                },
            },
        });
        const todosCount = prisma.todo.count({
            where: {
                userId: ctx.session.user.id,
            },
        });
        const categoriesCount = prisma.category.count({
            where: {
                userId: ctx.session.user.id,
            },
        });
        const [teams, todos, categories] = await prisma.$transaction([
            teamsCount,
            todosCount,
            categoriesCount,
        ]);

        const updatedUser = await prisma.user.update({
            where: {
                id: ctx.session.user.id,
            },
            data: {
                teamsCreatedCount: teams,
                todosCreatedCount: todos,
                categoriesCreatedCount: categories,
            },
        });
        return updatedUser;
    }),
});
