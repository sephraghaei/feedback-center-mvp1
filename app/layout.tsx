import { ClerkProvider } from "@clerk/nextjs";
import { faIR } from "@clerk/localizations";
import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import { APP_NAME } from "@/lib/config";
import ClientLogger from "./components/client-logger";
import "./globals.css";

const appName = APP_NAME;

export const metadata: Metadata = {
  title: appName,
  description: "مرکز بازخورد ساده و شفاف برای شنیدن نظر کاربران",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("fc-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){}',
          }}
        />
      </head>
      <body>
        <ClerkProvider
          localization={faIR}
          appearance={{
            variables: {
              colorPrimary: "var(--accent)",
              colorPrimaryForeground: "var(--on-accent)",
              colorBackground: "var(--surface)",
              colorForeground: "var(--ink)",
              colorMuted: "var(--fog)",
              colorMutedForeground: "var(--ink-3)",
              colorInput: "var(--surface)",
              colorInputForeground: "var(--ink)",
              colorBorder: "var(--hairline)",
              colorNeutral: "var(--ink)",
              colorShadow: "var(--ink)",
              colorSuccess: "var(--green)",
              colorDanger: "var(--red)",
              borderRadius: "0.75rem",
              fontFamily: '"Vazirmatn Variable", Vazirmatn, system-ui, sans-serif',
              fontSize: "0.875rem",
            },
            elements: {
              card: {
                border: "1px solid var(--hairline)",
                boxShadow: "var(--shadow-card)",
              },
              footer: {
                background: "var(--fog)",
              },
            },
          }}
        >
          <ClientLogger />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
