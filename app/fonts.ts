import localFont from "next/font/local";

export const IRANYekan = localFont({
  src: [
    { path: "./fonts/iranyekan/IRANYekan-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/iranyekan/IRANYekan-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/iranyekan/IRANYekan-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/iranyekan/IRANYekan-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-iranyekan",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  declarations: [{ prop: "font-family", value: "IRANYekan" }],
});
