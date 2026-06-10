import './globals.css';

export const metadata = {
  metadataBase: new URL('https://daniel-gadgets.vercel.app'),
  title: 'Daniel Gadgets | Premium Technology & Accessories',
  description:
    'Premium gadgets and smartphones at Daniel Gadgets. Official products with warranty.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Set the theme before first paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('dg_theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Orbitron:wght@400;500;700;800;900&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
