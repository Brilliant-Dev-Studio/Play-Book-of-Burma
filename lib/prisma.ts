import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaNeonHttp(process.env.DATABASE_URL!, {}),
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          let lastErr: unknown;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              return await query(args);
            } catch (err) {
              lastErr = err;
              const msg = err instanceof Error ? err.message : String(err);
              const isConnErr =
                msg.includes("fetch failed") ||
                msg.includes("Error connecting to database") ||
                msg.includes("socket disconnected") ||
                msg.includes("Server has closed the connection");
              if (!isConnErr) throw err;
              // exponential back-off: 600ms, 1200ms
              if (attempt < 2) await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
            }
          }
          throw lastErr;
        },
      },
    },
  });
}

type PrismaClientWithRetry = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientWithRetry };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
