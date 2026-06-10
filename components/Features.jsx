'use client';

import { openTikTok } from '@/lib/effects';

const FEATURES = [
  {
    delay: 'd1',
    path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'Official Warranty',
    text: "Every device comes with a comprehensive manufacturer's warranty for peace of mind.",
  },
  {
    delay: 'd2',
    path: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Global Logistics',
    text: 'Express worldwide shipping with real-time tracking from our hub to your doorstep.',
  },
  {
    delay: 'd3',
    path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Secure Checkout',
    text: 'Military-grade encryption for all transactions. We support Crypto & Fiat payments.',
  },
  {
    delay: 'd4',
    path: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    title: 'Expert Support',
    text: 'Our dedicated tech specialists are available 24/7 to assist with your setup and queries.',
  },
];

export default function Features() {
  return (
    <section className="sec features">
      <div className="sec-c fu">
        <div className="label">Why Choose Us</div>
        <h2 className="sec-title">The Daniel Edge</h2>
        <p className="sec-sub">We don&apos;t just sell gadgets; we deliver the future of connectivity.</p>
      </div>
      <div className="fgrid">
        {FEATURES.map((f) => (
          <div className={`fcard fu ${f.delay}`} key={f.title} onClick={openTikTok}>
            <div className="ficon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.path} />
              </svg>
            </div>
            <h3 className="ftitle">{f.title}</h3>
            <p className="ftxt">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
