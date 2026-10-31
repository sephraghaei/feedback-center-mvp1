"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { clientLogger, installClientLogging } from "@/lib/client-logger";

export default function ClientLogger() {
  const pathname = usePathname();

  useEffect(() => {
    installClientLogging();
  }, []);

  useEffect(() => {
    clientLogger.info("page.view", { context: { path: pathname || "/" } });
  }, [pathname]);

  return null;
}
