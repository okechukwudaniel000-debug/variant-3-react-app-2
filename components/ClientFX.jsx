'use client';

import { useEffect } from 'react';
import {
  revealObserve,
  scrambleObserve,
  counterObserve,
  setupMagnetic,
  setupNavShadow,
} from '@/lib/effects';

/* ============================================================
   Mounts the global, page-wide interactive effects after the
   static markup has rendered: scroll reveal, title scramble,
   animated counters, magnetic buttons and the nav scroll shadow.
   Dynamically-loaded sections (products) wire up their own
   reveal/magnetic when their content arrives.
============================================================ */
export default function ClientFX() {
  useEffect(() => {
    revealObserve(document);
    scrambleObserve(document);
    counterObserve(document);
    setupMagnetic(document);
    const cleanupNav = setupNavShadow();
    return () => {
      if (cleanupNav) cleanupNav();
    };
  }, []);

  return null;
}
