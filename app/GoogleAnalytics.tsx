"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

const GA_ID =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()) ||
  "G-56LYCR7CGV";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Envoie un page_view sur navigation (App Router) — évite doublon au 1er chargement */
function GaPageInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const first = useRef(true);

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== "function") return;
    const qs = searchParams.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;

    if (first.current) {
      first.current = false;
      return;
    }

    window.gtag("config", GA_ID, {
      page_path: path,
    });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalyticsRoute() {
  return (
    <Suspense fallback={null}>
      <GaPageInner />
    </Suspense>
  );
}
