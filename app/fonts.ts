import localFont from "next/font/local";

export const Estedad = localFont({
  src: "./fonts/estedad/Estedad-Variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-estedad",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  declarations: [{ prop: "font-family", value: "Estedad" }],
});
