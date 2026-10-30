import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import { APP_NAME } from "@/lib/config";
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
      <body>{children}</body>
    </html>
  );
}
