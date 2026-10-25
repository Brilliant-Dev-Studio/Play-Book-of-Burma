import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * pg v8 treats sslmode=require as verify-full and warns that v9 will change.
 * Opt into explicit libpq-compat so the warning goes away and behavior stays clear.
 * @see https://www.postgresql.org/docs/current/libpq-ssl.html
 */
function withPgSslCompat(connectionString: string): string {
  if (/[?&]uselibpqcompat=/i.test(connectionString)) return connectionString;
  if (!/[?&]sslmode=(prefer|require|verify-ca)\b/i.test(connectionString)) {
    return connectionString;
  }
  const sep = connectionString.includes("?") ? "&" : "?";
  return `${connectionString}${sep}uselibpqcompat=true`;
}

function createPrismaClient() {
  const adapter = new PrismaPg(
    withPgSslCompat(process.env.DATABASE_URL_UNPOOLED!),
  );
  return new PrismaClient({ adapter }).$extends({
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
