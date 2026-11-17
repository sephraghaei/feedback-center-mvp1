import localFont from "next/font/local";

export const dastkhat = localFont({
  src: "./fonts/dastkhat-variable.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-dastkhat",
  fallback: ["system-ui", "sans-serif"],
});
