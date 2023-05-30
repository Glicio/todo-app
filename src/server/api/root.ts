import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { todos } from "./routers/todos";
import { category } from "./routers/category";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({

  todos: todos,
  category: category,
});

// export type definition of API
export type AppRouter = typeof appRouter;
