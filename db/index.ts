import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export async function getDb() {
  const { env } = await import("cloudflare:workers");
  const runtime = env as unknown as { DB?: D1Database };
  if (!runtime.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Configure the `DB` D1 binding in wrangler.jsonc or in the Cloudflare deployment environment."
    );
  }

  return drizzle(runtime.DB, { schema });
}
