import { ClerkProvider } from "@clerk/nextjs";
import { enUS, faIR } from "@clerk/localizations";
import type { Metadata } from "next";
import "@fontsource-variable/noto-kufi-arabic";
import "@fontsource-variable/vazirmatn";
import ClientLogger from "./components/client-logger";
import { LocaleProvider } from "@/lib/i18n/client";
import { localeDir } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "fa") {
    return {
      title: "وسا",
      description:
        "ایده‌ها و مشکل‌ها رو جمع می‌کنیم، با رأی شما مرتبشون می‌کنیم و تا انتشار دنبالشون می‌مونیم.",
    };
  }
  return {
    title: "Vasa",
    description: "Collect feedback, let customers vote, and ship what they ask for.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={localeDir(locale)} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("fc-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var d=document.documentElement;d.dataset.theme=t;if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="hold";var release=function(){if(d.dataset.intro!=="hold")return;requestAnimationFrame(function(){requestAnimationFrame(function(){if(d.dataset.intro!=="hold")return;d.dataset.intro="play";setTimeout(function(){if(d.dataset.intro==="play")delete d.dataset.intro;},1900);});});};var hard=setTimeout(release,1600);document.addEventListener("DOMContentLoaded",function(){var cap=setTimeout(release,400);if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){clearTimeout(cap);clearTimeout(hard);release();});}else{clearTimeout(cap);clearTimeout(hard);release();}},{once:true});}}catch(e){}',
          }}
        />
      </head>
      <body>
        <LocaleProvider locale={locale}>
          <ClerkProvider
            localization={locale === "fa" ? faIR : enUS}
            appearance={{
              variables: {
                colorPrimary: "var(--clerk-primary)",
                colorPrimaryForeground: "var(--on-accent)",
                colorBackground: "var(--surface)",
                colorForeground: "var(--ink)",
                colorMuted: "var(--wash)",
                colorMutedForeground: "var(--ink-3)",
                colorInput: "var(--subtle)",
                colorInputForeground: "var(--ink-2)",
                colorBorder: "var(--input-line)",
                colorNeutral: "var(--ink)",
                colorShadow: "var(--ink)",
                colorSuccess: "var(--green)",
                colorDanger: "var(--red)",
                borderRadius: "0.625rem",
                fontFamily: "var(--font-ui)",
                fontSize: "0.875rem",
              },
              elements: {
                card: {
                  border: "1px solid var(--hairline)",
                  boxShadow: "var(--shadow-float)",
                },
                footer: {
                  background: "transparent",
                },
              },
            }}
          >
            <ClientLogger />
            {children}
          </ClerkProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
