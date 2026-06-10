import Link from 'next/link';
import Chrome from '@/components/Chrome';
import Products from '@/components/Products';
import Footer from '@/components/Footer';
import ClientFX from '@/components/ClientFX';

export const metadata = {
  title: 'Products | Daniel Gadgets',
  description:
    'Browse premium gadgets at Daniel Gadgets. Authentic smartphones, accessories, and technology.',
};

const MENU_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/#products', label: 'Products' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/#about', label: 'About Us' },
  { href: '/#contact', label: 'Contact' },
];

export default function ProductsPage() {
  return (
    <>
      <Chrome menuLinks={MENU_LINKS} />

      <main className="sec products" id="main-content">
        <div className="hud-corner hud-tl"></div>
        <div className="hud-corner hud-tr"></div>
        <div className="hud-corner hud-bl"></div>
        <div className="hud-corner hud-br"></div>

        <div className="pgrid-header fu">
          <div className="label">Explore Our Collection</div>
          <h1>Premium Gadgets</h1>
          <p className="sec-sub">
            Discover the latest in technology with our curated selection of high-end devices.
          </p>
          <Link href="/" className="back-home">
            ← Back to Main Site
          </Link>
        </div>

        <Products />
      </main>

      <Footer full={false} />

      <ClientFX />
    </>
  );
}
