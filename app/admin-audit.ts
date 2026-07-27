import { getAdminUser } from "./admin-auth";
import { ensurePlatformSchema } from "../db/platform";

type RuntimeEnv = { DB?: D1Database };

async function runtimeDb() {
  const { env } = await import("cloudflare:workers");
  return (env as unknown as RuntimeEnv).DB;
}

export async function writeAuditLog(input: {
  action: string;
  entityType: string;
  entityId?: string | number | null;
  details?: Record<string, unknown> | string | null;
}) {
  try {
    await ensurePlatformSchema();
    const db = await runtimeDb();
    if (!db) return;
    const user = await getAdminUser();
    const details =
      typeof input.details === "string"
        ? input.details
        : JSON.stringify(input.details ?? {});

    await db
      .prepare(
        `INSERT INTO audit_log
          (actor_email, action, entity_type, entity_id, details, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      )
      .bind(
        user?.email || "system",
        input.action,
        input.entityType,
        String(input.entityId ?? ""),
        details,
      )
      .run();
  } catch (error) {
    console.error("audit-log-write-failed", error);
  }
}
