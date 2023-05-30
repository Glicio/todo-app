import { PrismaClient } from "@prisma/client";

import { env } from "~/env.mjs";

import { connect } from "@planetscale/database";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const psConfig = {
    host: env.DATABASE_HOST,
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
}

export const db = connect(psConfig); 

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
