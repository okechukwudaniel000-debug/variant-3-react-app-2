import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Chrome from '@/components/Chrome';
import Footer from '@/components/Footer';
import ClientFX from '@/components/ClientFX';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getAllProducts, getProductById, getRelatedProducts, formatNaira } from '@/lib/products';

const SITE_URL = 'https://daniel-gadgets.vercel.app';

const MENU_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/#products', label: 'Products' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/#about', label: 'About Us' },
  { href: '/#contact', label: 'Contact' },
];

// Pre-render a static page per product.
export function generateStaticParams() {
  return getAllProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      type: 'website',
      title: `${product.name} | Daniel Gadgets`,
      description: product.description,
      url: `${SITE_URL}/products/${product.id}`,
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const related = getRelatedProducts(product);

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category,
    image: product.image ? [product.image] : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'NGN',
      availability: product.stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/products/${product.id}`,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${SITE_URL}/products/${product.id}`,
      },
    ],
  };

  return (
    <>
      <Chrome menuLinks={MENU_LINKS} />

      <main className="sec pdp-sec" id="main-content">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/products">Products</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <ProductDetailClient product={product} related={related} />

        <p className="visually-hidden">{formatNaira(product.price)}</p>
      </main>

      <Footer full={false} />
      <ClientFX />

      {/* suppressHydrationWarning: the CSP nonce is stripped from the DOM by the
          browser after load, so the client renders nonce="" — expected. */}
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}
