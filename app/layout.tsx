import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "پروژه سیاه";

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
