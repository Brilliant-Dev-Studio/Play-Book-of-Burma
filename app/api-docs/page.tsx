import { requireAdmin } from "@/lib/server/auth-helpers";
import { SwaggerClient } from "./swagger-client";

export default async function ApiDocsPage() {
  await requireAdmin();

  return (
    <main className="min-h-dvh bg-black">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="font-(family-name:--font-rwst-stack) text-3xl font-bold tracking-tight text-white">
            API Docs
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Interactive reference for every route under app/api. Spec:{" "}
            <a href="/openapi.json" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">
              /openapi.json
            </a>
          </p>
        </div>
        <div className="rounded-2xl bg-white p-2">
          <SwaggerClient />
        </div>
      </div>
    </main>
  );
}
