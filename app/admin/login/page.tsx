import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "../../lib/auth";
import { getT } from "../../lib/i18n-server";
import { Logo } from "../../components/Logo";
import { LoginForm } from "../ui/LoginForm";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  const { t } = await getT();
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div
        className="hidden bg-cover bg-center lg:block"
        style={{ backgroundImage: "linear-gradient(rgb(10 37 24 / .35), rgb(10 37 24 / .65)), url('/assets/hero_image.png')" }}
        aria-hidden="true"
      />
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Logo size="lg" />
          <h1 className="mt-8 text-2xl font-bold">{t("دخول لوحة التحكم", "Sign in to the dashboard")}</h1>
          <p className="mt-2 text-sm text-moss">{t("للإدارة بس.", "For store staff only.")}</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
