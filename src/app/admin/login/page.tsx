import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/forms";
import { login } from "../_actions/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getUser()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8">
        <h1 className="text-xl font-semibold text-slate-900">{siteConfig.name}</h1>
        <p className="mb-6 mt-1 text-sm text-slate-600">Sign in to the admin panel</p>
        <LoginForm action={login} />
      </div>
    </main>
  );
}
