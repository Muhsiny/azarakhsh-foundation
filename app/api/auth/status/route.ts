type RuntimeEnv = {
  DB?: D1Database;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
};

export async function GET() {
  const { env } = await import("cloudflare:workers");
  const runtime = env as unknown as RuntimeEnv;
  const checks = {
    adminEmail: Boolean(runtime.ADMIN_EMAIL?.trim()),
    adminPassword: Boolean(runtime.ADMIN_PASSWORD),
    sessionSecret: Boolean(runtime.SESSION_SECRET),
    database: Boolean(runtime.DB),
  };

  return Response.json(
    {
      ready: Object.values(checks).every(Boolean),
      checks,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
