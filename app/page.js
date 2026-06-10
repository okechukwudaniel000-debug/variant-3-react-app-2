import Chrome from '@/components/Chrome';
import Hero from '@/components/Hero';
import Products from '@/components/Products';
import Features from '@/components/Features';
import Reviews from '@/components/Reviews';
import Footer from '@/components/Footer';
import ClientFX from '@/components/ClientFX';

const MENU_LINKS = [
  { href: '/', label: 'Home' },
  { href: '#products', label: 'Featured Products' },
  { href: '#reviews', label: 'Customer Reviews' },
  { href: '#about', label: 'About Our Brand' },
  { href: '#contact', label: 'Get in Touch' },
];

export default function HomePage() {
  return (
    <>
      <Chrome menuLinks={MENU_LINKS} showThemeToggle />

      <Hero />

      {/* ======== TRUST ======== */}
      <div className="trust">
        <div className="trust-grid">
          <div className="titem">
            <div className="tnum" data-to="50" data-sfx="K+">
              0
            </div>
            <div className="tlbl">Customers</div>
          </div>
          <div className="titem">
            <div className="tnum" data-to="100" data-sfx="%" data-dec="0">
              0
            </div>
            <div className="tlbl">Authentic</div>
          </div>
          <div className="titem">
            <div className="tnum" data-to="24" data-sfx="/7">
              0
            </div>
            <div className="tlbl">Support</div>
          </div>
          <div className="titem">
            <div className="tnum" data-to="4.9" data-sfx="/5" data-dec="1">
              0
            </div>
            <div className="tlbl">Rating</div>
          </div>
        </div>
      </div>

      {/* ======== PRODUCTS ======== */}
      <section className="sec products" id="products">
        <div className="hud-corner hud-tl"></div>
        <div className="hud-corner hud-tr"></div>
        <div className="hud-corner hud-bl"></div>
        <div className="hud-corner hud-br"></div>

        <div className="sec-c fu">
          <div className="label">Our Collection</div>
          <h2 className="sec-title">Featured Devices</h2>
          <p className="sec-sub">
            Curated high-performance technologies for the modern professionals.
          </p>
        </div>

        <Products />
      </section>

      <Features />

      <Reviews />

      {/* ======== ABOUT ======== */}
      <section className="sec about" id="about">
        <div className="about-inner fu">
          <div className="label">Behind The Brand</div>
          <h2 className="sec-title">Defining Tomorrow</h2>
          <p className="about-txt">
            Founded in 2020, Daniel Gadgets has become a beacon for technology enthusiasts in
            Nigeria and beyond. We believe that technology should be accessible, authentic, and
            empowering. Our mission is to bridge the gap between innovation and reality, providing
            our customers with the tools they need to thrive in a digital world.
          </p>
          <div className="about-line"></div>
        </div>
      </section>

      {/* ======== CONTACT ======== */}
      <section className="sec contact" id="contact">
        <div className="sec-c fu">
          <div className="label">Connect</div>
          <h2 className="sec-title">Join Our Community</h2>
          <p className="sec-sub">Stay updated with the latest tech drops and exclusive offers.</p>
        </div>
        <div className="cicons">
          <div className="citem fu d1">
            <a
              href="https://wa.me/2349132715125"
              target="_blank"
              rel="noopener noreferrer"
              className="clink"
              style={{ '--pc': '#25D366' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
            <span className="clbl">WhatsApp</span>
          </div>
          <div className="citem fu d2">
            <a
              href="https://www.tiktok.com/@danielclothings_"
              target="_blank"
              rel="noopener noreferrer"
              className="clink"
              style={{ '--pc': '#000' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
            <span className="clbl">TikTok</span>
          </div>
          <div className="citem fu d3">
            <a
              href="https://t.me/DanielClothings000"
              target="_blank"
              rel="noopener noreferrer"
              className="clink"
              style={{ '--pc': '#0088cc' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.53.26l.195-2.82 5.12-4.62c.22-.19-.047-.304-.34-.11l-6.33 3.98-2.73-.85c-.594-.185-.605-.594.124-.88l10.66-4.11c.494-.18.927.115.75.96z" />
              </svg>
            </a>
            <span className="clbl">Telegram</span>
          </div>
        </div>
      </section>

      <Footer full />

      <ClientFX />
    </>
  );
}
