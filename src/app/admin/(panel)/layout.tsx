import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { ADMIN_ONLY, CONTENT_ROLES, LEAD_ROLES, hasRole, requireUser } from "@/lib/auth";
import { RESOURCES } from "@/lib/admin/resources";
import { logout } from "../_actions/auth";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const linkClass = "block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100";
  const headingClass = "mb-1 mt-5 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400";

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="px-5 py-4">
          <p className="font-semibold text-slate-900">{siteConfig.name}</p>
          <p className="text-xs text-slate-500">Admin panel</p>
        </div>
        <nav className="flex flex-wrap gap-x-1 px-2 pb-3 lg:block">
          <Link href="/admin" className={linkClass}>
            Dashboard
          </Link>
          {hasRole(user, LEAD_ROLES) ? (
            <>
              <p className={`hidden lg:block ${headingClass}`}>Leads</p>
              <Link href="/admin/leads" className={linkClass}>
                All leads
              </Link>
              <Link href="/admin/leads/new" className={linkClass}>
                Add lead
              </Link>
            </>
          ) : null}
          {hasRole(user, CONTENT_ROLES) ? (
            <>
              <p className={`hidden lg:block ${headingClass}`}>Website content</p>
              {RESOURCES.map((resource) => (
                <Link key={resource.key} href={`/admin/content/${resource.key}`} className={linkClass}>
                  {resource.label}
                </Link>
              ))}
            </>
          ) : null}
          {hasRole(user, ADMIN_ONLY) ? (
            <>
              <p className={`hidden lg:block ${headingClass}`}>Settings</p>
              <Link href="/admin/users" className={linkClass}>
                Users
              </Link>
            </>
          ) : null}
        </nav>
        <div className="border-t border-slate-200 px-5 py-4 text-sm">
          <p className="font-medium text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{user.role}</p>
          <div className="mt-3 flex items-center gap-4">
            <Link href="/" className="text-brand-600 hover:underline">
              View site
            </Link>
            <form action={logout}>
              <button type="submit" className="text-slate-600 hover:underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
    </div>
  );
}
