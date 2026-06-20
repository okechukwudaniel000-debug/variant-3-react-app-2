'use client';

import { useEffect } from 'react';
import { revealObserve, counterObserve, setupMagnetic, setupNavShadow } from '@/lib/effects';

/* ============================================================
   Mounts the global, page-wide interactive effects after the
   static markup has rendered: scroll reveal, animated counters,
   magnetic buttons and the nav scroll shadow. (Heading colour-flow
   is handled in pure CSS — see globals.css.)
   Dynamically-loaded sections (products) wire up their own
   reveal/magnetic when their content arrives.
============================================================ */
export default function ClientFX() {
  useEffect(() => {
    revealObserve(document);
    counterObserve(document);
    setupMagnetic(document);
    const cleanupNav = setupNavShadow();
    return () => {
      if (cleanupNav) cleanupNav();
    };
  }, []);

  return null;
}
