import { ClerkProvider } from "@clerk/nextjs";
import { enUS } from "@clerk/localizations";
import type { Metadata } from "next";
import ClientLogger from "./components/client-logger";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vasa",
  description: "Collect feedback, let customers vote, and ship what they ask for.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
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
          localization={enUS}
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
      </body>
    </html>
  );
}
