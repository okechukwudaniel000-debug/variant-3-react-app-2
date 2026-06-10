import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { StoreProvider } from '@/components/StoreProvider';
import Products from '@/components/Products';
import { getAllProducts } from '@/lib/products';

// Mock Next's image/link so the grid renders as plain DOM in jsdom.
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function renderGrid() {
  return render(
    <StoreProvider>
      <Products />
    </StoreProvider>
  );
}

describe('<Products /> grid', () => {
  it('renders one card per product and all derived category filters', () => {
    renderGrid();
    expect(screen.getByText(`${getAllProducts().length} products`)).toBeInTheDocument();
    for (const label of ['All', 'Phones', 'Tablets', 'Audio', 'Gaming']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('filters by category', () => {
    renderGrid();
    fireEvent.click(screen.getByRole('button', { name: 'Audio' }));
    const audioCount = getAllProducts().filter((p) => p.category === 'audio').length;
    expect(screen.getByText(`${audioCount} products`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Audio' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('searches and shows an empty state with reset', () => {
    renderGrid();
    fireEvent.change(screen.getByPlaceholderText('Search products…'), {
      target: { value: 'iphone' },
    });
    const iphones = getAllProducts().filter((p) => /iphone/i.test(p.name)).length;
    expect(screen.getByText(`${iphones} products`)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search products…'), {
      target: { value: 'zzzznomatch' },
    });
    expect(screen.getByText('No products match your search.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getByText(`${getAllProducts().length} products`)).toBeInTheDocument();
  });

  it('adds to wishlist via the heart toggle', () => {
    renderGrid();
    const grid = document.querySelector('.pgrid') as HTMLElement;
    const firstHeart = within(grid).getAllByRole('button', { pressed: false })[0];
    fireEvent.click(firstHeart);
    expect(firstHeart).toHaveAttribute('aria-pressed', 'true');
  });
});
