import { getChatGPTUser } from "./chatgpt-auth";

type RuntimeEnv = {
  ADMIN_EMAIL?: string;
};

async function configuredAdminEmail() {
  const { env } = await import("cloudflare:workers");
  return (env as unknown as RuntimeEnv).ADMIN_EMAIL?.trim().toLowerCase() ?? "";
}

export async function isAdminRequest() {
  const user = await getChatGPTUser();
  const adminEmail = await configuredAdminEmail();
  return Boolean(
    user && adminEmail && user.email.trim().toLowerCase() === adminEmail,
  );
}

export async function requireAdminPage() {
  const user = await getChatGPTUser();
  const adminEmail = await configuredAdminEmail();
  return {
    user: user ?? {
      displayName: "مدیر بنیاد",
      email: "",
      fullName: null,
    },
    authorized:
      Boolean(user && adminEmail) &&
      Boolean(user) &&
      user.email.trim().toLowerCase() === adminEmail,
  };
}
