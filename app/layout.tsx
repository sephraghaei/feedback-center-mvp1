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
  description: "یک پروژه ساده و سیاه با فونت وزیرمتن",
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
              colorPrimary: "#f4f4f4",
              colorBackground: "#0b0b0b",
              borderRadius: "0.75rem",
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
