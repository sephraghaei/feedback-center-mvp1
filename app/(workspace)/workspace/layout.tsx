import type { Metadata } from "next";
import Link from "next/link";
import WorkspaceSidebar from "@/app/components/workspace/workspace-sidebar";
import { getWorkspaceContext } from "@/lib/workspace";
import { translator } from "@/lib/i18n/locale";
import { getLocale, getT } from "@/lib/i18n/server";
import "../../feedback.css";
import "../../board.css";
import "../../workspace.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = translator(await getLocale());
  return {
    title: t("پنل شرکت | وسا", "Workspace | Vasa"),
    description: t(
      "فیدبک، نقشه راه، تغییرات و تیمت رو همین‌جا مدیریت کن.",
      "Manage feedback, roadmap, updates and your team.",
    ),
  };
}

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const context = await getWorkspaceContext("/workspace");
  const t = await getT();

  if (!context) {
    return (
      <div className="wk-no-company">
        <div className="wk-no-company-card">
          <h1>{t("هنوز پنل شرکتی نداری", "No company workspace yet")}</h1>
          <p>
            {t(
              "این حساب هنوز عضو هیچ شرکتی نیست. از مالک شرکت بخواه از صفحه تیم در پنلش اضافه‌ت کنه و بعد برگرد همین‌جا.",
              "This account is not part of a company yet. Ask a company owner to add you from their workspace team page, then come back here.",
            )}
          </p>
          <div className="wk-no-company-actions">
            <Link href="/" className="bd-btn">
              {t("بازگشت به وسا", "Back to Vasa")}
            </Link>
            <Link href="/" className="bd-btn bd-btn-primary">
              {t("دیدن بردهای عمومی", "Browse public boards")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wk-shell">
      <WorkspaceSidebar
        company={{ slug: context.company.slug, name: context.company.name }}
        user={context.viewer.name}
        role={context.role}
        method={context.viewer.method}
        memberships={context.memberships.map((entry) => ({
          slug: entry.company.slug,
          name: entry.company.name,
        }))}
      />
      <main className="wk-main">{children}</main>
    </div>
  );
}
