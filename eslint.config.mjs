import next from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'fullstack/**',
      'main.js',
      'style.css',
      '*.html',
      'next-env.d.ts',
    ],
  },
  ...next,
  {
    rules: {
      'react/no-unescaped-entities': 'warn',
      // SSR-safe hydration (reading localStorage on mount to set theme/cart/
      // wishlist) legitimately requires setState inside an effect; surfacing as
      // a warning rather than blocking the build.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];

export default config;
