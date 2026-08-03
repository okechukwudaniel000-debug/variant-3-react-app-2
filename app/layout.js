import './globals.css';
import './elite.css';
import { headers } from 'next/headers';
import { Montserrat, DM_Sans, Orbitron, Space_Grotesk } from 'next/font/google';
import { StoreProvider } from '@/components/StoreProvider';
import CartDrawer from '@/components/CartDrawer';
import QuickView from '@/components/QuickView';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800', '900'],
  variable: '--font-orbitron',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
});

const SITE_URL = 'https://daniel-gadgets.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Daniel Gadgets | Premium Technology & Accessories',
    template: '%s | Daniel Gadgets',
  },
  description:
    'Premium gadgets, smartphones, laptops and accessories at Daniel Gadgets. 100% authentic products with official warranty and fast delivery across Nigeria.',
  keywords: [
    'Daniel Gadgets',
    'buy iPhone Nigeria',
    'Samsung Galaxy Nigeria',
    'premium gadgets',
    'authentic smartphones',
    'laptops',
    'accessories',
  ],
  applicationName: 'Daniel Gadgets',
  authors: [{ name: 'Daniel Gadgets' }],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    siteName: 'Daniel Gadgets',
    title: 'Daniel Gadgets | Premium Technology & Accessories',
    description:
      'Authentic smartphones, laptops and accessories with official warranty and fast delivery.',
    url: SITE_URL,
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daniel Gadgets | Premium Technology & Accessories',
    description:
      'Authentic smartphones, laptops and accessories with official warranty and fast delivery.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020205',
};

// Set the theme before first paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('dg_theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Daniel Gadgets',
  url: SITE_URL,
  description:
    'Premium gadgets, smartphones, laptops and accessories with official warranty and fast delivery across Nigeria.',
  sameAs: [
    'https://www.tiktok.com/@danielclothings_',
    'https://t.me/DanielClothings000',
    'https://wa.me/2349132715125',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: '+2349132715125',
    areaServed: 'NG',
    availableLanguage: 'English',
  },
};

export default async function RootLayout({ children }) {
  // Nonce minted per-request by middleware.ts; required by the strict CSP.
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${montserrat.variable} ${dmSans.variable} ${orbitron.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* suppressHydrationWarning: browsers hide the CSP nonce from the DOM
            after load, so the client sees nonce="" — this is expected, not a bug. */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <StoreProvider>
          {children}
          <CartDrawer />
          <QuickView />
        </StoreProvider>
      </body>
    </html>
  );
}
