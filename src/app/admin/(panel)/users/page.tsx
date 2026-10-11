import type { Metadata } from "next";
import { ADMIN_ONLY, requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/db";
import { NewUserForm, UserRowForm } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { createUser, updateUser } from "../../_actions/users";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const current = await requireUser(ADMIN_ONLY);
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  return (
    <>
      <PageHeader title="Users" text="Staff who can sign in to this admin panel." />
      <div className="max-w-4xl space-y-6">
        {users.map((user) => (
          <Panel key={user.id}>
            <div className="mb-4">
              <p className="font-semibold text-slate-900">
                {user.name}
                {user.id === current.id ? <span className="ml-2 text-xs font-normal text-slate-500">(you)</span> : null}
              </p>
              <p className="text-sm text-slate-600">
                {user.email} · added {formatDate(user.createdAt)}
              </p>
            </div>
            <UserRowForm action={updateUser.bind(null, user.id)} user={{ id: user.id, role: user.role, active: user.active }} />
          </Panel>
        ))}
        <Panel title="Add a user">
          <NewUserForm action={createUser} />
        </Panel>
      </div>
    </>
  );
}
