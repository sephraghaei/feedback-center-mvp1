import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "SAV | ساو",
  description:
    "SAV connects businesses with followers through a public announcement feed, in-app alerts and email. ساو اعلان کسب‌وکارها را به مخاطبانشان می‌رساند.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
