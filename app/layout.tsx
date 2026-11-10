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
    <html lang="fa" dir="rtl">
      <body>
        <ClerkProvider
          localization={faIR}
          appearance={{
            variables: {
              colorPrimary: "#171717",
              colorPrimaryForeground: "#ffffff",
              colorBackground: "#ffffff",
              colorForeground: "#171717",
              colorMuted: "#f5f5f5",
              colorMutedForeground: "#666666",
              colorInput: "#ffffff",
              colorInputForeground: "#171717",
              colorBorder: "#ebebeb",
              colorNeutral: "#171717",
              colorShadow: "#171717",
              colorSuccess: "#297a3a",
              borderRadius: "0.375rem",
              fontFamily: '"Vazirmatn Variable", Vazirmatn, system-ui, sans-serif',
              fontSize: "0.875rem",
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
