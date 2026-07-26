import {
  createAdminUser,
  deleteAdminUser,
  isOwnerRequest,
  listAdminUsers,
  updateAdminUser,
  type AdminRole,
} from "../../../admin-auth";

export async function GET() {
  if (!(await isOwnerRequest())) {
    return Response.json({ error: "فقط مالک اجازه دارد." }, { status: 403 });
  }
  return Response.json({ users: await listAdminUsers() });
}

export async function POST(request: Request) {
  if (!(await isOwnerRequest())) {
    return Response.json({ error: "فقط مالک اجازه دارد." }, { status: 403 });
  }
  const payload = (await request.json()) as {
    email?: string;
    displayName?: string;
    role?: Exclude<AdminRole, "owner">;
    password?: string;
  };
  await createAdminUser({
    email: payload.email ?? "",
    displayName: payload.displayName ?? "",
    role: payload.role ?? "editor",
    password: payload.password ?? "",
  });
  return Response.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isOwnerRequest())) {
    return Response.json({ error: "فقط مالک اجازه دارد." }, { status: 403 });
  }
  const payload = (await request.json()) as {
    id?: number;
    displayName?: string;
    role?: Exclude<AdminRole, "owner">;
    status?: "active" | "disabled";
    password?: string;
  };
  if (!payload.id) return Response.json({ error: "شناسه الزامی است." }, { status: 400 });
  await updateAdminUser(payload.id, payload);
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isOwnerRequest())) {
    return Response.json({ error: "فقط مالک اجازه دارد." }, { status: 403 });
  }
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return Response.json({ error: "شناسه نامعتبر است." }, { status: 400 });
  await deleteAdminUser(id);
  return Response.json({ ok: true });
}
