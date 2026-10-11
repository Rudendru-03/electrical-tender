import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, buttonClass } from "@/components/ui";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold text-amber-600">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-900">{t("title")}</h1>
      <p className="mt-3 text-slate-600">{t("text")}</p>
      <Link href="/" className={buttonClass("dark", "mt-8")}>
        {t("home")}
      </Link>
    </Container>
  );
}
