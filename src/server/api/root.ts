import { createTRPCRouter } from "~/server/api/trpc";
import { todos } from "./routers/todos";
import { category } from "./routers/category";
import { teams } from "./routers/teams";
import { user } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({

  todos: todos,
  category: category,
  teams: teams,
  user: user,
});

// export type definition of API
export type AppRouter = typeof appRouter;
