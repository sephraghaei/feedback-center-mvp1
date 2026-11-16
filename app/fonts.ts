import localFont from "next/font/local";

export const IRANSans = localFont({
  src: [
    { path: "./fonts/iransans/IranianSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/iransans/IranianSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-iransans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
