import localFont from "next/font/local";

export const Dana = localFont({
  src: "./fonts/dana/DanaVF.woff2",
  weight: "10 990",
  style: "normal",
  variable: "--font-dana",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
